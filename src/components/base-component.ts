// Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
