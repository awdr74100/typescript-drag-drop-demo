namespace App {
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

  export class ProjectState extends State<Project> {
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

      this.updateListeners();
    }

    public moveProject(projectId: string, newStatus: ProjectStatus) {
      const projectIndex = this.projects.findIndex(({ id }) => id === projectId);

      if (projectIndex === -1) return; // 檢查對象是否存在 (避免更改非目標對象狀態)

      if (this.projects[projectIndex]!.status === newStatus) return; // 檢查狀態是否相同 (避免相同的渲染)

      this.projects[projectIndex]!.status = newStatus;

      this.updateListeners();
    }

    private updateListeners() {
      this.listeners.forEach((listenerFunc) => {
        listenerFunc([...this.projects]); // 傳送副本陣列而不是原始陣列 (避免傳址特性引發的潛在問題)
      });
    }
  }

  export const projectState = ProjectState.getInstance();
}
