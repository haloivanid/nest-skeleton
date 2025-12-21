import { PaginationMetaResponseDto, SortingMetaResponseDto } from '@libs/dto';

export class MetaResponseDto {
  paging: PaginationMetaResponseDto;
  sorting: SortingMetaResponseDto;
}
