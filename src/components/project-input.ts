import { default as Component } from './base-component.js';
import * as Validation from '../utils/validation.js';
import { Autobind as AutobindDecorator } from '../decorators/autobind.js';
import { projectState } from '../state/project.js';

// ProjectInput Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

    const titleValidatable: Validation.Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validation.Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validation.Validatable = {
      value: parseInt(enteredPeople, 10),
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !Validation.validate(titleValidatable) ||
      !Validation.validate(descriptionValidatable) ||
      !Validation.validate(peopleValidatable)
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
  @AutobindDecorator
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
