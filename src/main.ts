// Project State Management
class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {}

  public static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new ProjectState();
    return this.instance;
  }

  public addListener(listenerFunc: Function) {
    this.listeners.push(listenerFunc);
  }

  public addProject(title: string, description: string, numOfPeople: number) {
    this.projects.push({
      id: Math.random().toString(), // 並非真正的唯一值 (使用庫生成最好)
      title,
      description,
      people: numOfPeople,
    });

    this.listeners.forEach((listenerFunc) => {
      listenerFunc([...this.projects]); // 傳送副本陣列而不是原始陣列 (避免傳址特性引發的潛在問題)
    });
  }
}

/**
 * 全域實例: 為可在任何地方使用的實例常數 (通常類定義完後就馬上實例化)
 * 單例模式: 為確保整個應用都使用同個實例的設計手段 (保證類始終只有一個實例即每次的調用都將返回同個實例)
 * 使用目的: 本就只想提供唯一的全域狀態管理物件 (調用相同實例可使狀態始終同步)
 */
// const projectState = new ProjectState();
const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean; // 也可寫為 required: boolean | undefined (就為問號的實際表示)
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

// Autobind Decorator (接受函式陳述式或函式表達式)
function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
  return {
    configurable: true,
    get() {
      return descriptor.value.bind(this);
    },
  };
}

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement; // 可透過 HTMLElement 表示不存在元素類型 (屬於其他特定元素類型的基類)
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.querySelector('#project-list')!;
    this.hostElement = document.querySelector('#app')!;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    /**
     * 初始化字段: 所在 addListener 的回調並不會在建構函式立刻被調用，故不算初始化字段
     * 初始化限制: 初始化予值的行為必須明確定義於建構函式，無法透過調用方法來初始化字段
     */
    this.assignedProjects = [];

    /**
     * 註冊偵聽器函式: 傳遞回調給 projectState 進行管理，也表示回調將由 projectState 主動調用才被觸發
     * 觸發偵聽器回調: 由調用 projectState.addProject 方法間接調用回調 (同時接收已更新的項目列表)
     */
    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listElement = document.querySelector(`#${this.type}-projects-list`) as HTMLUListElement;

    this.assignedProjects.forEach((projectItem) => {
      const listItemElement = document.createElement('li');
      listItemElement.textContent = projectItem.title;

      listElement.appendChild(listItemElement);
    });
  }

  private renderContent() {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  /**
   * 建構函式: 進行選擇 (Selection) 和粗略設置邏輯
   * 單獨方法: 進行插入 (Insertion) 或微調 (Fine Tuning) 邏輯
   */
  constructor() {
    /**
     * getElementById: 不支持泛型，必須使用類型轉換
     * querySelector: 支持泛型，僅指示為非 null 即可
     */
    this.templateElement = document.getElementById('project-input') as HTMLTemplateElement;
    this.hostElement = document.getElementById('app') as HTMLDivElement;

    /**
     * content: 為 HTMLTemplateElement 中的屬性，將提供模板內容的引用
     */
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector('#title')!;
    this.descriptionInputElement = this.element.querySelector('#description')!;
    this.peopleInputElement = this.element.querySelector('#people')!;

    this.configure();
    this.attach();
  }

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

  @Autobind
  private submitHandler(e: Event) {
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

  private configure() {
    /**
     * 偵聽器的回調將使 this 指向偵聽元素，可透過手動 bind 或裝飾器自動 bind 來解決問題
     */
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
