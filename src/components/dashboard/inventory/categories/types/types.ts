export type CategoryWithChildren = {
  id: string;
  name: string;
  children: CategoryWithChildren[];
};
