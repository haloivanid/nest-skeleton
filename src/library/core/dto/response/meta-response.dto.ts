import { PaginationMetaResponseDto, SortingMetaResponseDto } from '@libs/core/dto';

export class MetaResponseDto {
  paging: PaginationMetaResponseDto;
  sorting: SortingMetaResponseDto;
}
