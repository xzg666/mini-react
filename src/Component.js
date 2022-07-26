export default function Component(props){
    this.props = props
}

Component.prototype.isReactComponent = {} //区分类组件和函数组件，类组件是undefined