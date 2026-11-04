/**
 * Investigation Engine — dossiers and viewer interactions (structure only).
 * No dossier content is invented; dossiers will be authored later.
 */
export interface DossierClue {
  id: string;
  text: string;
  revealed: boolean;
}

export interface Dossier {
  id: string;
  title: string;
  sceneId: string;
  clues: DossierClue[];
}

export class InvestigationEngine {
  private dossiers = new Map<string, Dossier>();
  add(d: Dossier) { this.dossiers.set(d.id, d); }
  list() { return [...this.dossiers.values()]; }
  reveal(dossierId: string, clueId: string) {
    const c = this.dossiers.get(dossierId)?.clues.find((x) => x.id === clueId);
    if (c) c.revealed = true;
    return c;
  }
}
