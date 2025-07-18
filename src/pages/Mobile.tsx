import { Button } from "@material-tailwind/react";

export default function Mobile() {
  return (
    <div className="h-full relative">
    <div className="bg relative"> Mobile Version </div>
    <div className="absolute inset-x-0 gap-1 bottom-0 flex justify-center bg bg-blue-600 rounded-3xl">
      <Button className="bg bg-blue-900 text-xs rounded-3xl border-0">Ajouter recette</Button>
      <Button className="bg bg-blue-900 rounded-3xl border-0">Générer recette</Button>
      <Button className="bg bg-blue-900 rounded-3xl border-0">Mon compte</Button>


    </div>
    </div>
  )
}