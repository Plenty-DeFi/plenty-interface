import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
import lineBg from './assets/images/banner-bg.png';
import waBglight from './assets/images/WrappedAssets/ic_light-1440.svg';
import waBg from './assets/images/WrappedAssets/ic_dark-1440.svg';

export const lightTheme = {
  name: 'light',
  body: '#F9FAFA',
  p: '#4e5d78',
  span: '#4e5d78',
  hr: '#d2d2d2',
  logo: '#5603AD',
  logoFrontPage: '#FFFFFF',
  frontPageGradient: `url(${lineBg}), linear-gradient(180.62deg,#7028E4 100.71%,#E5B2CA 0%)`,
  frontPageBottomGradient: `url(${lineBg}), linear-gradient(180.62deg,#7028E4 100.71%,#E5B2CA 0%)`,
  WrappedAssetsGradient: `url(${waBglight})`,
  topGradient: 'linear-gradient(178.62deg, #7028E4 16.71%, #E5B2CA 217.99%)',
  bg: '#FFFFFF',
  bgAlt: '#FFFFFF',
  backgroundLight: '#F9FAFA',
  borderDarkNone: '1px solid rgba(44, 9, 11, 0.08)',
  border: '1px solid rgba(44, 9, 11, 0.08)',
  btnFrontPage: '#823DE0',
  dropdownThemed: '#FFFFFF',
  dropdownThemedHighlight: '#eeeeee',
  iconFill: '#4E5D78',
  iconHoverFill: '#ffffff',
  iconBgStartColor: '#D2D5DB',
  iconBgHover: '#6202ef',
  iconBgEndColor: '#D2D5DB',
  iconHoverBgStartColor: '#7028E4',
  iconHoverBgEndColor: '#E5B2CA',
};

export const darkTheme = {
  name: 'dark',
  body: 'linear-gradient(108.61deg, #04152E -24.15%, #343C49 99.76%)',
  p: '#FFFFFF',
  span: '#FFFFFF',
  hr: '#f1f1f1',
  logo: '#FFFFFF',
  logoFrontPage: '#FFFFFF',
  frontPageGradient: `url(${lineBg})`,
  frontPageBottomGradient: `url(${lineBg})`,
  WrappedAssetsGradient: `url(${waBg})`,
  topGradient: 'transparent',
  bg: '#201c41',
  bgAlt: '#252146',
  backgroundLight: '#343052',
  borderDarkNone: 'none',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  btnFrontPage: '#19263A',
  dropdownThemed: '#514b6b',
  dropdownThemedHighlight: '#5e6884',
  iconFill: '#FFFFFF',
  iconHoverFill: '#252146',
  iconBgStartColor: '#3D395F',
  iconBgEndColor: '#3D395F',
  iconBgHover: '#CEAEFE',
  iconHoverBgStartColor: '#7028E4',
  iconHoverBgEndColor: '#E5B2CA',
};

export const FrontPageGradientDiv = styled.div`
  background-image: ${(props) => props.theme.frontPageGradient};
`;
export const WrappedAssetsGradientDiv = styled.div`
  background-image: ${(props) => props.theme.WrappedAssetsGradient};
`;

export const TopGradientDiv = styled.div`
  background-image: ${(props) => props.theme.topGradient};
`;

export const FrontPageBottomGradientDiv = styled.div`
  background-image: ${(props) => props.theme.frontPageBottomGradient};
`;

export const GlobalStyles = createGlobalStyle`
  .start-color {
    stop-color: ${(props) => props.theme.iconBgStartColor};
    &:hover {
      stop-color: ${(props) => props.theme.iconBgHover};
    }
  }
  &:hover {
   > .start-color{
    stop-color: ${(props) => props.theme.iconBgHover};
    }
  }
  
  .end-color {
    stop-color: ${(props) => props.theme.iconBgEndColor};
    &:hover {
      stop-color: ${(props) => props.theme.iconBgHover};
    }
  }
  &:hover {
   > .end-color{
    stop-color: ${(props) => props.theme.iconBgHover};
    }
  }
  
  .icon-themed {
    > .icon-fill-themed {
        fill: ${(props) => props.theme.iconFill};
      }
    
    &:hover {
      > .icon-fill-themed {
        fill: ${(props) => props.theme.iconHoverFill};
      }
    }
    > .icon-bg-gradient{
      fill: ${(props) => props.theme.iconBgEndColor};
    }
    &:hover {
      > .icon-bg-gradient{
      fill: ${(props) => props.theme.iconBgHover};
      }
  }

  }
  .discord-icon-bg-gradient{
   
        fill: ${(props) => props.theme.iconBgEndColor};
      
    
    &:hover {
     
        fill: ${(props) => props.theme.iconBgHover};
      
    }
  }
  
  .span-themed {
    color: ${(props) => props.theme.span} !important;
  }
  
  .bg-themed {
    background: ${(props) => props.theme.bg} !important;
  }
  
  .bg-themed-alt {
    background: ${(props) => props.theme.bgAlt};
  }
  
  .bg-themed-light {
    background: ${(props) => props.theme.backgroundLight};
  }
  
  .modal-themed {
    .modal-content {
      background-color: ${(props) => props.theme.bg} !important;
    }
  }
  
  .border-themed-dark-none {
    border: ${(props) => props.theme.borderDarkNone};
  }
  
  .border-bottom-themed-dark-none {
    border-bottom: ${(props) => props.theme.borderDarkNone};
  }
  
  .border-bottom-themed {
    border-bottom: ${(props) => props.theme.border};
  }
  
  .dropdown-themed {
    background: ${(props) => props.theme.dropdownThemed};
    
    &:hover {
          background: ${(props) => props.theme.dropdownThemedHighlight};
    };
  }
  
  .logo {
    fill: ${(props) => props.theme.logo};
  }
  
  .logo-frontPage {
    fill: ${(props) => props.theme.logoFrontPage};
  }
  
  .btn-frontPage {
    color: ${(props) => props.theme.btnFrontPage};
  }
`;
