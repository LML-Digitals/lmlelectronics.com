import { Terms, TermVersion } from '@prisma/client';

export type TermWithVersions = Terms & {
  versions: TermVersion[];
};

export type TermVersionWithTerm = TermVersion & {
  terms: Terms;
};
