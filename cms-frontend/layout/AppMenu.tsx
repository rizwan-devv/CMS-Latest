/* eslint-disable @next/next/no-img-element */

import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { menuItems } from '@/lib/menuConfig';
import { useAuth } from '@/services/auth/AuthContext';
import type { AppMenuItem } from '@/types';
import type { MenuResponse } from '@/types/menu';

function normalizeIcon(icon?: string | null): string {
    if (!icon || !icon.trim()) return 'pi pi-fw pi-circle';
    const value = icon.trim();
    if (value.startsWith('pi ')) return value;
    if (value.startsWith('pi-')) return `pi pi-fw ${value}`;
    return `pi pi-fw ${value}`;
}

function isCategoryPath(path?: string | null): boolean {
    if (!path || !path.trim()) return true;
    const p = path.trim();
    return p === '#' || p.startsWith('#');
}

function toAppMenuItems(menus: MenuResponse[]): AppMenuItem[] {
    const mapped: AppMenuItem[] = menus.map((menu) => {
        const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;
        const category = hasChildren || isCategoryPath(menu.menuPath);
        return {
            label: menu.menuName,
            icon: normalizeIcon(menu.menuIcon),
            // Categories are section headers (no navigation); leaves keep their path
            to: category ? undefined : menu.menuPath,
            items: hasChildren ? toAppMenuItems(menu.children!) : undefined,
        };
    });

    // Sakai root items must be sections with children. Wrap orphan leaves so they stay visible.
    const rootsWithChildren = mapped.filter((m) => m.items && m.items.length > 0);
    const rootLeaves = mapped.filter((m) => !m.items || m.items.length === 0);
    if (rootLeaves.length > 0) {
        rootsWithChildren.unshift({
            label: 'Menu',
            items: rootLeaves,
        });
    }
    return rootsWithChildren;
}

const AppMenu = () => {
    const { user } = useAuth();
    const dynamicItems = user?.menus && user.menus.length > 0 ? toAppMenuItems(user.menus) : menuItems;
    return (
        <MenuProvider>
            <ul className="layout-menu">
                {dynamicItems.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator" key={item.label}></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
