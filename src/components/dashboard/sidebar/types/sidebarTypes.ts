import { JSX } from 'react';

export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  role: string[];
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type SideNavItemGroup = {
  title: string;
  menuList: SideNavItem[];
};
