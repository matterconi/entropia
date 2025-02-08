// posts.js
import occhi from "./ho-dimenticato-il-colore-dei-tuoi-occhi";
import donna from "./la-donna-e-il-pozzo-1";
import filo from "./la-storia-del-filo-derba-e-della-margherita";
import balcone from "./la-vista-dal-balcone";
import lilla from "./lilla";
import ore from "./ore";

const posts = [
  {
    ...occhi,
    id: "ho dimenticato il colore dei tuoi occhi",
  },
  {
    ...donna,
    id: "la donna e il pozzo",
  },
  {
    ...filo,
    id: "la storia del filo d'erba e della margherita",
  },
  {
    ...lilla,
    id: "che di dir si oda",
  },
  {
    ...balcone,
    id: "la vista dal balcone",
  },
  {
    ...ore,
    id: "ore sospese",
  },
];

export default posts;
