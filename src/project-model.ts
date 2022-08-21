namespace App {
  // Project Status Enum
  export enum ProjectStatus {
    Active,
    Finished,
  }

  // Project Type
  export class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public people: number,
      public status: ProjectStatus, // 當然也可使用聯合文字類型 (但由於此處不需要具備可讀故使用 enum 可能更加適合)
    ) {}
  }
}
