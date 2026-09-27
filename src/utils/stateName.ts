export interface State {
  name: string;
  abbreviation: string;
}

export function formatState(state: State): string {
  return `${state.name} (${state.abbreviation})`;
}
