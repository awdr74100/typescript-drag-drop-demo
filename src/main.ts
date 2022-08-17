// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(e: DragEvent): void; // DragEvent 與先前 SubmitEvent 同為 TypeScript 內建類型 (由 lib.dom 庫提供支持)
  dragEndHandler(e: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(e: DragEvent): void;
  dropHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}

// Project Status Enum
enum ProjectStatus {
  Active,
  Finished,
}

// Project Type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus, // 當然也可使用聯合文字類型 (但由於此處不需要具備可讀故使用 enum 可能更加適合)
  ) {}
}

interface Role<T> {
  name: T;
}

// Project State Management
type Listener<T> = (items: T[]) => void; // 泛型也可用於 type 或 interface (概念同樣為藉由外部傳遞類型來定義類型)

class State<T> {
  /**
   * 泛型傳遞: 與一般泛型傳遞沒有差別 (這邊設計為由 State 接受泛型並轉發給 Listener 泛型，兩邊使用相同泛型標識符就如同不同方法使用相同參數名稱本就不會有任何影響)
   * protected 修飾元: 相比 private 修飾元將允許子類訪問 (但仍然無法由外部訪問)
   */
  protected listeners: Listener<T>[] = [];

  public addListener(listenerFunc: Listener<T>) {
    this.listeners.push(listenerFunc);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = []; // 陣列的每個項目為 Project 的實例 (class 相較 interface 除同樣可用來約束物件外，還可實例化物件)
  private static instance: ProjectState;

  /**
   * 私有建構函式: 通常用於單例模式下確保建構函式無法由外部實例化，僅類內部可實例化 (由類靜態方法選擇返回新實例或已存在實例)
   */
  private constructor() {
    super();
  }

  public static getInstance() {
    /**
     * 全域實例: 為可在任何地方使用的實例常數 (通常類定義完後就馬上實例化，即 new ProjectState()，參考下面調用 getInstance 方法位置)
     * 單例模式: 為確保整個應用都使用同個實例的設計手段 (保證類始終只有一個實例即每次的調用都將返回同個實例)
     * 使用目的: 本就只想提供唯一的全域狀態管理物件 (調用相同實例可使狀態始終同步)
     */
    if (!this.instance) this.instance = new ProjectState();

    return this.instance;
  }

  public addProject(title: string, description: string, numOfPeople: number) {
    /**
     * 物件實字 (Object Literal): 不具備初始類型約束 (僅後續使用可由類型推斷約束類型，初始設置不具備任何約束，打錯字也不會抱錯)
     * 建構函式 (Constructor Function): 具備初始類型約束 (基於類所實例化物件的行為自然受到參數及類型的約束)
     * 生成結果: 兩種建立方式就結果而言並無任何差別，最終都將生成物件
     */
    const project = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active, // 每個新加入項目預設都屬於激活狀態
    );

    this.projects.push(project);

    this.listeners.forEach((listenerFunc) => {
      listenerFunc([...this.projects]); // 傳送副本陣列而不是原始陣列 (避免傳址特性引發的潛在問題)
    });
  }
}

const projectState = ProjectState.getInstance();

// Validation Utility
interface Validatable {
  value: string | number;
  required?: boolean; // 也可寫為 required: boolean | undefined (就為問號的實際表示)(函式參數也為同個概念)
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  if (
    validatableInput.required &&
    (Number.isNaN(validatableInput.value) || !validatableInput.value.toString().trim())
  )
    return false;

  if (
    typeof validatableInput.minLength === 'number' &&
    typeof validatableInput.value === 'string' &&
    validatableInput.value.length < validatableInput.minLength
  )
    return false;

  if (
    typeof validatableInput.maxLength === 'number' &&
    typeof validatableInput.value === 'string' &&
    validatableInput.value.length > validatableInput.maxLength
  )
    return false;

  if (
    typeof validatableInput.min === 'number' &&
    typeof validatableInput.value === 'number' &&
    validatableInput.value < validatableInput.min
  )
    return false;

  if (
    typeof validatableInput.max === 'number' &&
    typeof validatableInput.value === 'number' &&
    validatableInput.value > validatableInput.max
  )
    return false;

  return true;
}

// Autobind Function Decorator
function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
  return {
    configurable: true,
    get() {
      return descriptor.value.bind(this);
    },
  };
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement; // 當元素不存在特定類型時可分配 HTMLElement 類型 (為所有特定元素類型的基礎通用類型)
  hostElement: T; // 透過泛型來分配動態類型使元素類型可根據子類傳入類型而定義 (約束為 HTMLElement 使泛型仍可獲得元素通用屬性提示)
  element: U;

  constructor(
    templateElementId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(templateElementId) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;
    this.element = document.importNode(this.templateElement.content, true).firstElementChild as U; // content 為 HTMLTemplateElement 中的屬性，將提供模板內容的引用

    if (newElementId) this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element,
    );
  }

  /**
   * 抽象類: 使類無法被直接實例化 (應始終僅用於繼承)
   * 抽象方法: 僅定義類型而不存在實現 (子類得存在該方法且根據所定義外觀類型進行實作)
   * 誤區: 抽象類仍舊可包含已實作的方法，僅標記為抽象的方法需單純定義類型 (並不是抽象類中僅可存在抽象的對象。把抽象類、方法分開並單純從定義來看就對了)
   */
  public abstract configure(): void; // 也可添加問號將其轉為可選方法使子類不被強迫添加 (如 abstract configure?(): void)

  public abstract renderContent(): void; // 抽象修飾元無法與私有修飾元並用即抽象修飾元始終與公共修飾元並用 (公共抽象修飾元使子類必須存在該方法且只能是公共的)
}

// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  /**
   * 常見約定為將 getter/setter 添加至字段正下方 (也為建構函式上方)
   */
  public get persons() {
    return `${this.project.people} ${this.project.people === 1 ? 'person' : 'persons'}`;
  }

  constructor(hostElementId: string, project: Project) {
    super('single-project', hostElementId, false, project.id);

    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  public dragStartHandler(e: DragEvent) {
    console.log(e);
  }

  @Autobind
  public dragEndHandler(_: DragEvent) {
    console.log('DargEnd');
  }

  public configure() {
    // 記得在欲拖動元素添加 draggable="true" 屬性 (此為 template 中的 li 屬性)
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  public renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`); // 調用 super 所傳遞參數同樣不能使用 this 引用

    /**
     * 初始化字段: 所在 addListener 的回調並不會在建構函式立刻被調用，故不算初始化字段
     * 初始化限制: 初始化予值的行為必須明確定義於建構函式，無法透過調用方法來初始化字段
     */
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  public configure() {
    /**
     * 註冊偵聽器函式: 傳遞回調給 projectState 進行管理，也表示回調將由 projectState 主動調用才被觸發
     * 觸發偵聽器回調: 由調用 projectState.addProject 方法間接調用回調 (同時接收已更新的項目列表)
     * 偵聽器回調類型: 此處偵聽器回調中的參數實則不用定義類型 (將參考 addListener 方法中的函式類型參數中的已定義參數類型)
     */
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(({ status }) => {
        return status === (this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  public renderContent() {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    this.element.querySelector(`#${this.type}-projects-list`)!.replaceChildren(); // 清除遺留元素 (確保每次都為全新渲染)

    this.assignedProjects.forEach((projectItem) => {
      new ProjectItem(`${this.type}-projects-list`, projectItem); // 實例化時就已依靠繼承的 Component 類進行生成 (載入模板內容) 及附加動作
    });

    // const listElement = document.querySelector(`#${this.type}-projects-list`) as HTMLUListElement;

    // const listItemElements = this.assignedProjects.map((projectItem) => {
    //   const listItemElement = document.createElement('li');
    //   listItemElement.textContent = projectItem.title;
    //   return listItemElement;
    // });

    // /**
    //  * innerHTML: 一般較常使用 innerHTML 並將其設為空字串以清除元素底下的所有元素 (此指 listElement.innerHTML = '')
    //  * replaceChildren: 除 IE 外的瀏覽器皆已支援的新快速清除/覆蓋方法 (不指定覆蓋對象將使其清除底下所有元素，指定覆蓋對象將使其覆蓋底下所有元素)
    //  * 目的: 重新渲染的初始行為。意即先清除舊有內容再進行渲染 (確保舊有內容不會遺留於元素上)
    //  */
    // listElement.replaceChildren(...listItemElements);
  }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  /**
   * 建構函式: 進行選擇 (Selection) 和粗略設置邏輯
   * 單獨方法: 進行插入 (Insertion) 或微調 (Fine Tuning) 邏輯
   */
  constructor() {
    super('project-input', 'app', true, 'user-input');

    /**
     * getElementById: 不支持泛型，必須使用類型轉換
     * querySelector: 支持泛型，僅指示為非 null 即可
     */
    this.titleInputElement = this.element.querySelector('#title')!;
    this.descriptionInputElement = this.element.querySelector('#description')!;
    this.peopleInputElement = this.element.querySelector('#people')!;

    /**
     * 字段初始化行為必須存在於建構函式中 (意指無法透過調用存在初始化字段行為的方法來進行初始化，TypeScript 會認為依舊沒有初始化故報錯)
     */
    this.configure();
  }

  /**
   * 常見約定為 public 方法在上 (建構函式下)，而 private 方法在下
   */
  public configure() {
    /**
     * 偵聽器的回調將使 this 指向偵聽元素，可透過手動 bind 或裝飾器自動 bind 來解決問題
     */
    this.element.addEventListener('submit', this.submitHandler);
  }

  public renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    /**
     * 從任何輸入元素中提取的 value 屬性都將是 string 類型的
     */
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: parseInt(enteredPeople, 10),
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    }

    return [enteredTitle, enteredDescription, parseInt(enteredPeople, 10)];
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  /**
   * Event: 為所有特定行為預設分配的特定事件的基礎通用類型
   * SubmitEvent: 為 submit 行為預設分配的特定事件
   */
  @Autobind
  private submitHandler(e: SubmitEvent) {
    e.preventDefault();

    /**
     * 從運行時的角度來看，元組最終只是個陣列，可透過 Array.isArray() 來檢查
     */
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;

      /**
       * 簡單實現加入項目: 直接查找 #active-projects-list 後加入/渲染新項目
       * 物件導向加入項目: 在 ProjectList 類透過 addProject 方法加入/渲染新項目 (ProjectInput 類內部透過傳遞進來的 ProjectList 實例調用該方法)
       * 狀態管理加入項目: 參考當前例子
       */
      projectState.addProject(title, description, people);

      this.clearInputs();
    }
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
