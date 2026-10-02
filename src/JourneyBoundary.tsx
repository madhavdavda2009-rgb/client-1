import { Component, type ReactNode } from 'react';
export default class JourneyBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){document.documentElement.dataset.worldFallback='true';document.documentElement.style.overflow=''}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}
