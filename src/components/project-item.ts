import { Component } from './base-component.js';
import { Draggable } from '../models/drag-drop.js';
import { Project } from '../models/project.js';
import { Autobind } from '../decorators/autobind.js';

// ProjectItem Class
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
    /**
     * e.dataTransfer: 為僅存在類型為 DragEvent 的物件中的物件屬性，其中存放拖放過程附加的數據
     * e.dataTransfer 可能不存在: 並不是所有與拖放相關的事件觸發回調所提供的 DragEvent 類型物件都存在該屬性 (意即將取決於事件類型，而 dragstart 事件確實存在該屬性)
     */
    e.dataTransfer!.setData('text/plain', this.project.id); // 僅附加可表示該物件的唯一值而非整個物件將節省記憶體空間 (後續依然可透過唯一值從 ProjectState 找回物件)
    e.dataTransfer!.effectAllowed = 'move'; // 指定拖動到允許 drop 行為的元素時游標所呈現的效果 (就只是單純的更改不存在於 CSS 而更為直觀的游標樣式)(在 dragstart 以外的事件中設置該屬性將無效)
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
