import { useTheme } from 'next-themes';
import Image from 'next/image';

export const SideBarLogo = () => {
  const { theme } = useTheme();
  return (
    <Image
      width={35}
      alt=""
      className="w-12 ml-0 min-h-fit rounded-sm"
      height={35}
      src={
        theme === 'dark' || theme === 'custom'
          ? '/logo.png'
          : '/logo.png'
      }
    />
  );
};
