import './App.css'
import Lead from './components/lead'
import Info from './components/info'
import Board from './components/board'
import Details from './components/details'
import { FlexCol } from './components/flex'

export default function App() {
  return (
    <FlexCol>
      <Lead />
      <Details />
      <Board />
      <Info />
    </FlexCol>
  )
}
