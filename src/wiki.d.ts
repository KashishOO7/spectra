declare module '#spectra-wiki/page/*' {
  const note: import('$lib/wiki/page').WikiPage;
  export default note;
}
declare module '#spectra-wiki/glossary' {
  const glossary: Record<string, import('$lib/audit/glossary-md').GlossaryEntry[]>;
  export default glossary;
}
declare module '#spectra-wiki/playbooks' {
  const playbooks: Record<string, import('$lib/wiki/page').WikiPage>;
  export default playbooks;
}
