import { Component } from './base-component.js';
import { ProjectItem } from './project-item.js';
import { DragTarget } from '../models/drag-drop.js';
import { Project, ProjectStatus } from '../models/project.js';
import { Autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project.js';

// ProjectList Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

  /**
   * 根據實現所必要定義屬性及方法: 確切定義位置及順序將取決於你 (表示不存在限制)
   */
  @Autobind
  public dragOverHandler(e: DragEvent) {
    if (e.dataTransfer?.types[0] !== 'text/plain') return; // 僅允許附加指定格式數據的 drag 行為有能力觸發 drop 事件 (即像是附加圖片等為不同格式數據的 drag 行為都將返回)

    e.preventDefault(); // 取消 dragover 事件的預設處理才能觸發同個偵聽元素的 drop 事件 (否則 drop 事件無法被觸發且游標套用 not-allowed 樣式)

    this.element.querySelector('ul')!.classList.add('droppable');
  }

  @Autobind
  public dropHandler(e: DragEvent) {
    /**
     * 保護模式: e.dataTransfer 就如同 e.files 都將只在執行期間填充自身物件，執行結束後將回到使訪問始終為空物件的保護模式
     * 打印為空: 當物件回到保護模式時將一併清除所有數據，而受到傳址特性影響的打印物件自然為空物件
     * 有效訪問: 避免直接訪問 e.dataTransfer 物件，而是訪問 e.dataTransfer 內的屬性或方法，將可如預期取得內容 (value)
     */
    const projectId = e.dataTransfer!.getData('text/plain');
    const newStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished;

    projectState.moveProject(projectId, newStatus);
  }

  @Autobind
  public dragLeaveHandler(_: DragEvent) {
    this.element.querySelector('ul')!.classList.remove('droppable');
  }

  public configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);

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
