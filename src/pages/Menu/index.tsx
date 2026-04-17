import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCafeteriaMenu, IMenuItem, TicketType } from '@hooks/cafeteria';
import { Button, Box, Checkbox } from '@mui/material';
import { setLocalStorage, getSelectedMenu, getMenuDisplayState, setMenuDisplayState, getMenus } from '@utils/storageUtils';
import { LoadingOverlay, BasicTable, TColumn } from '@components';

import MenuDisplayStateModal from './MenuDisplayStateModal';
import { WhiteWrapper, SelectedMenuButton, StyledSwitch } from './styles';

export type MenuDisplayValue = { menuId: string; menuName: string; menuPrice: string; ticketType: TicketType };

export type MenuColumnOptions = {
  selectedMenuId?: string;
  onSelectMenu: (menuId: string, menuInfo: IMenuItem) => void;
  onOpenMenuEdit: (menuId: string) => void;
  onToggleMenuVisible: (menuId: string, fieldName: string, value: boolean) => void;
};

const createMenuColumns = ({
  selectedMenuId,
  onSelectMenu,
  onOpenMenuEdit,
  onToggleMenuVisible
}: MenuColumnOptions): TColumn<IMenuItem>[] => [
  {
    fieldStyle: { width: '28px', padding: '0px' },
    cellRenderer: (_, values) => (
      <Checkbox
        sx={{ left: '10px', padding: '0px' }}
        checked={values?.id === selectedMenuId}
        onClick={() => onSelectMenu(values.id, values)}
      />
    )
  },
  { field: 'name', headerName: '매뉴명' },
  {
    field: 'price',
    fieldStyle: { width: '80px', fontWeight: '700' },
    headerName: '매뉴 금액',
    align: 'right',
    cellRenderer: (value) => Number(value || 0).toLocaleString()
  },
  {},
  {
    field: 'isShowMenuName',
    fieldStyle: { width: '70px' },
    headerName: '메뉴명 표시',
    align: 'center',
    cellRenderer: (value, values) => {
      const checked = Boolean(value);
      return <StyledSwitch checked={checked} onChange={() => onToggleMenuVisible(values.id, 'isShowMenuName', !checked)} />;
    }
  },
  {
    field: 'isShowMenuPrice',
    fieldStyle: { width: '70px' },
    headerName: '메뉴 금액 표시',
    align: 'center',
    cellRenderer: (value, values) => {
      const checked = Boolean(value);
      return <StyledSwitch checked={checked} onChange={() => onToggleMenuVisible(values.id, 'isShowMenuPrice', !checked)} />;
    }
  },
  {
    fieldStyle: { width: '80px' },
    align: 'right',
    cellRenderer: (_, values) => (
      <Button sx={{ height: '32px', color: '#ffffff' }} onClick={() => onOpenMenuEdit(values.id)}>
        설정
      </Button>
    )
  }
];

const normalizeMenuDisplay = (menu: IMenuItem): IMenuItem => ({
  ...menu,
  isShowMenuName: menu.isShowMenuName ?? true,
  isShowMenuPrice: menu.isShowMenuPrice ?? true
});

const MenuPage = () => {
  const navigate = useNavigate();

  const [menuDisplay, setMenuDisplay] = useState<IMenuItem[]>(() => (getMenuDisplayState() ?? []).map(normalizeMenuDisplay));
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string>();
  const [editedMenuId, setEditedMenuId] = useState<string>();

  const { data: menuResponse, isLoading } = useGetCafeteriaMenu();

  useEffect(() => {
    setSelectedMenuId(getSelectedMenu()?.id);
  }, []);

  useEffect(() => {
    const baseMenus = menuResponse?.menu ?? [];

    if (baseMenus?.length) {
      setLocalStorage('menus', baseMenus); // 원본 저장

      const savedDisplay = getMenuDisplayState() ?? [];
      const storedById = new Map(savedDisplay?.map((menu) => [menu?.id, menu]));

      const nextDisplayState = baseMenus.map((menu) => normalizeMenuDisplay({ ...menu, ...storedById.get(menu.id) }));
      setMenuDisplay(nextDisplayState);
      setMenuDisplayState(nextDisplayState);
    }
  }, [menuResponse?.menu]);

  const updateDisplayMenu = useCallback((menuId: string, updater: (base: IMenuItem) => Partial<IMenuItem>) => {
    setMenuDisplay((prevState) => {
      const currentMenus = getMenus() ?? [];
      const baseMenu = prevState?.find((menu) => menu?.id === menuId) ?? currentMenus.find((menu) => menu?.id === menuId);
      if (!baseMenu) return prevState;

      const updatedMenu = { ...normalizeMenuDisplay(baseMenu), ...updater(baseMenu) };

      const isExist = prevState.some((menu) => menu?.id === menuId);
      const nextDisplayState = isExist ? prevState.map((menu) => (menu?.id === menuId ? updatedMenu : menu)) : [...prevState, updatedMenu];

      setMenuDisplayState(nextDisplayState);
      return nextDisplayState;
    });
  }, []);

  const handleSelectMenu = useCallback((menuId: string, menuInfo: IMenuItem) => {
    setSelectedMenuId(menuId);
    setLocalStorage('selectedMenu', menuInfo);
  }, []);

  const handleToggleModal = useCallback((menuId?: string) => {
    setEditedMenuId(menuId);
    setIsModalOpen((prevState) => !prevState);
  }, []);

  const handleMenuVisibility = useCallback(
    (menuId: string, fieldName: string, value: boolean) => {
      updateDisplayMenu(menuId, (menu) => ({ ...menu, [fieldName]: value }));
    },
    [updateDisplayMenu]
  );

  const handleSubmit = (values: MenuDisplayValue) => {
    updateDisplayMenu(values.menuId, (menu) => ({
      ...menu,
      name: values.menuName,
      price: Number(values.menuPrice || 0),
      ticketType: values.ticketType
    }));
    handleToggleModal();
  };

  const columns = useMemo(() => {
    return createMenuColumns({
      selectedMenuId,
      onSelectMenu: handleSelectMenu,
      onOpenMenuEdit: handleToggleModal,
      onToggleMenuVisible: handleMenuVisibility
    });
  }, [selectedMenuId, handleSelectMenu, handleToggleModal, handleMenuVisibility]);

  const menuRows = useMemo(() => {
    const baseMenus = menuResponse?.menu ?? [];
    const displayMenuById = new Map<string, IMenuItem>(menuDisplay.map((menu) => [menu.id, normalizeMenuDisplay(menu)]));

    return baseMenus.map((menu) => {
      const displayMenu = displayMenuById.get(menu.id);
      return normalizeMenuDisplay(
        displayMenu
          ? {
              ...menu,
              ...displayMenu,
              name: displayMenu.name !== menu.name ? `${displayMenu.name}(${menu.name})` : menu.name
            }
          : menu
      );
    });
  }, [menuResponse?.menu, menuDisplay]);

  return (
    <Box sx={{ padding: '0px 8px 8px', position: 'relative' }}>
      <WhiteWrapper>
        <BasicTable columns={columns} data={menuRows} onRowClick={(values) => handleSelectMenu(values?.id, values)} />
      </WhiteWrapper>
      <SelectedMenuButton disabled={!selectedMenuId} onClick={() => navigate('/cafeteria/payment')}>
        메뉴 선택 완료
      </SelectedMenuButton>
      {/* 로딩 레이아웃 */}
      <LoadingOverlay open={isLoading} />
      {/* 메뉴 정보 수정 */}
      <MenuDisplayStateModal menuId={editedMenuId} open={isModalOpen} onClose={handleToggleModal} onSubmit={handleSubmit} />
    </Box>
  );
};

export default MenuPage;
