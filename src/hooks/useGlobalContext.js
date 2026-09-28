import { useContext } from "react"
import { EasyContext } from "../context"

export const useGlobalContext = () => {
   return useContext(EasyContext);
}