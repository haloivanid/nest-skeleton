import { SortingField } from '@libs/types';

export class SortingMetaResponseDto {
  availableSortFields: string[];
  currentSortFields: SortingField[];
}
