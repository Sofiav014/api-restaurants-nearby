export class PaginationResultDto<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;

  constructor(
    data: T[],
    totalItems: number,
    currentPage: number,
    limit: number,
  ) {
    this.data = data;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
    this.limit = limit;
    this.totalPages = Math.ceil(totalItems / limit);
  }
}
