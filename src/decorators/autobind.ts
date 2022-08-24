namespace App {
  // Autobind Function Decorator
  export function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
    return {
      configurable: true,
      get() {
        return descriptor.value.bind(this);
      },
    };
  }
}
