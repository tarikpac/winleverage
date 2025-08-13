{ pkgs }:
{
  deps = [
    pkgs.chromium

    # Core libs equivalentes ao "install-deps" do Playwright
    pkgs.glib
    pkgs.nspr
    pkgs.nss
    pkgs.dbus
    pkgs.atk
    pkgs.at-spi2-atk
    pkgs.cups
    pkgs.xorg.libxcb
    pkgs.libxkbcommon
    pkgs.at-spi2-core
    pkgs.xorg.libX11
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXdamage
    pkgs.xorg.libXext
    pkgs.xorg.libXfixes
    pkgs.xorg.libXrandr
    pkgs.xorg.libXrender
    pkgs.xorg.libXcursor
    pkgs.xorg.libXi
    pkgs.xorg.libXScrnSaver
    pkgs.xorg.libXinerama
    pkgs.mesa
    pkgs.libdrm
    pkgs.cairo
    pkgs.pango
    pkgs.harfbuzz
    pkgs.alsaLib
    pkgs.fontconfig
    pkgs.freetype
    pkgs.expat
    pkgs.icu
    pkgs.gtk3

    # Fontes para evitar problemas de renderização/headless
    pkgs.noto-fonts
    pkgs.noto-fonts-cjk
    pkgs.noto-fonts-emoji
    
    pkgs.libxss
    pkgs.libxinerama
    pkgs.libgbm
    pkgs.libxshmfence
  ];
}


