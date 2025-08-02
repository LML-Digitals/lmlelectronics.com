'use client';

import { useSideBarToggle } from '@/hooks/useSidebarToggle';
import type { SideNavItemGroup } from './types/sidebarTypes';
import classNames from 'classnames';
import { SideBarMenuItem } from './SidebarMenuItem';
import { useEffect, useState } from 'react';
import { fetchSession } from '@/lib/session';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'framer-motion';

const SideBarMenuGroup = ({ menuGroup }: { menuGroup: SideNavItemGroup }) => {
  const { toggleCollapse } = useSideBarToggle();
  const [user, setUser] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInSession: any = await fetchSession();
        setUser(userInSession.user);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchData();
  }, []);

  const menuGroupTitleStyle = classNames(
    'py-3 px-2 tracking-[.1rem] font-semibold uppercase text-xs text-muted-foreground flex items-center cursor-pointer hover:text-foreground transition-colors duration-200 rounded-md hover:bg-muted/50',
    {
      'text-center justify-center': toggleCollapse,
    }
  );

  // Filter and sort menu items by user role and character length
  const filteredMenuList = (menuGroup.menuList || [])
    .filter(item => user && (item.role.includes(user.role) || item.role.includes('all')))
    .sort((a, b) => a.title.length - b.title.length);

  // Don't render if no items are available for this user
  if (filteredMenuList.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <div className={menuGroupTitleStyle} onClick={() => setIsOpen(!isOpen)}>
        <span className="truncate">{!toggleCollapse ? menuGroup.title : '...'}</span>
        {!toggleCollapse && (
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {filteredMenuList.length}
            </Badge>
            <ChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              size={12}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="space-y-0.5 mt-1">
            {filteredMenuList.map((item, index) => (
              <SideBarMenuItem key={index} item={item} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideBarMenuGroup;
