import React from 'react';
import axios from "axios"; // import d'axios

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query='; // URL de l'api qui va nous envoyer les data

const useSemiPersistentState = (key, initialState) => { // hook custom qui reprend les 2 autres, j'utilise volontairement value pour pouvoir le réutiliser ou je veux avec de l'array destructuring d'ou l'utilisation de key pour pas écraser la value précedente si je l'utilise plusieurs fois
  const [value, setValue] = React.useState( // fonction useState utiliser pour travailler sur des etat, La fonction useState est ce que l'ont apelle un hook ('crohet / hameçons')
    localStorage.getItem(key) || initialState // utilisation stockage en local de sont navigateur pour stocker une clé et un état initaile encore pour un soucis de réusabilité (je sais pas si ce mot est français mais ta compris)
  );

  React.useEffect(() => { // Second type de hook aprés useState, le navigateur utilise sont stockage en local pour afficher la derniere value utiliser, cela peut être vue comme un "side-effect" car ont intéragie avec l'API de sont navigateur en dehors de react.
    localStorage.setItem(key, value);
    console.log(value);
    console.log(key);
  }, [value, key]); // avec ce second argument la fonction seras appelé a chaque fois que value change (pour toujours avoir la derniere value en storage local)

  return [value, setValue];
};

const storiesReducer = (state, action) => { // bon ici j'ai utiliser des switch et des cases, déja pour changer un peut de syntax et surtout parceque des if else imbriquer dans tout les sens sa me gonfle et c'est ilisible
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error(); // erreur pour me dire qu'aucun de ces cas ne correspond a ce que je veux faire.
  }
};

const App = () => { // TRADUCTION DU CODE: "const" -> la constante     "App" -> App     "=" -> est        "()"-> une fonction *** peux aussi s'écrire: "function App()" mais ont fait du React la donc ont utilise au plus les composants stateless quand c'est possible
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search', // key di hook = search
    'React' // etat initiale du hook = React
  );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = React.useReducer( // tableau vide pour récuperation des data, dispatchstories va me servir a générer l'etat de mes actions et le resultat qui va en découller
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => { // je déplace toutes mes data récupérer dans une fonction en dehors du side effect, je les je les envoie avec un hooke useCallback 
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url); // Utilisation d'axios plutot que fetch. l'url correpond au début a API_ENDPOINT et la fin a la recherche que l'ont effectue.
      // toute les actions aprés le await ne sont pas éxécuter tant que la promise n'est pas résolue.
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits // sa envoie un payload a l'etat de notre component
      });
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE'})
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories(); // et je récupere mes data envoyer avec le useCallback ici
  }, [handleFetchStories]);

  /* 
  PETIT POINT TECHNO, POURQUOI AVOIR FAIT UNE FONCTION AVEC USECALLBACK ICI?
  si l'ont avait pas fait de fonction avec useCallback une nouvelle fonction handleFetchStories aurait était créer
  a chaque rendu de App component, et aurait était éxécuter avec le hook useEffect pour récupérer les data, les
  data ainsi récuperer aurait était stocker comme état dans le component, parceque l'etat du component avait changer.
  Ce qui aurait eu pour éffet de créer une nouvelle fois la fonction handleFetchStories, et le side effect aurait était déclencher
  pour récuperer les data. boucle infini.
  1. une recherche ce fait
  2. la fonction handleFetchStories se lance pour cherche les resultat correspondant
  3. Récupération des datas coorepondantes avec useEffect
  4. App component fait un nouveaux rendu avec les data correpondantes a la recherche
  5. l'etat de App component change vue que useEffect a valider sont changement d'etat
  6. les data sont stockée comme état de App component
  7. la fonction handleFetchStories voit que l'etat de App component n'est pas le même que celui renvoyait en dernier par le side effect et useEffect 
  8. la fonction ce dit que c'est une nouvelle recherche
  9. repartir de l'étape 1
  Le fait d'utiliser useCallback fait que le  la fonction lance une recherche seulement quand les therme dans la barre de recheche change
  */

  const handleRemoveStory = item => { // suppresion d'un item de la liste, avec comme type d'action remove story
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => { // envoie de la fin de l'url si jamais l'ont éffectue une recherche et que l'ont appuie sur le bouton
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  return (
    <div>
      <h1>Hacker News</h1>

      <SearchForm // utilisation du component SearchForm qui contient notre formulaire et notre bouton d'envoie
        searchTerm={searchTerm} // ici on définis searchTerm comme étant le string contenue dans le derniers envoie du formulaire
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />
      
      {stories.isError && <p>Une erreur est survenue . . .</p>}{" "}
      {/* avec react '&&' est trés pratique, si la condition est true l'expression aprés le '&&' est sortie, si c'est false React ignore totalement l'expression */}
      {stories.isLoading ? (
        <p>Chargement . . .</p>
      ) : (
        <List // appelle du component "List" et ont définis que list est égale au data renvoyer par L'API
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}
    </div>
  );
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel // ont fait sa car si ont a un autre champs de recherche sur la page étant donner que la combinaison htmlFor et id et dupliquer ont peut avoir des bugs
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Rechercher:</strong> {/* premier enfant de 'inputWithLabel' */}
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Envoyer
    </button>
  </form>
);

const InputWithLabel = ({ // pour éviter d'avoir a taper 'props.' sinon ont devrais taper 'value={props.value}' et 'onChange={props.onInputChange}'
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <> {/* "<>" et "</>" sont des input wrap sa permet de pas avoir a marquer div ou span par exemple, je suis pas fan de cette syntaxe mais sa a le mérite d'être autoriser en JSX */}
      <label htmlFor={id}>{children}</label> {/* Utilisation du premier enfant de inputWithLabel pour l'affichage du champs de recherche */}
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) =>
  list.map(item => (
    <Item
      key={item.objectID} // ici ont prend L'objectId et pas l'index dans le tableux sinon sa peut tout foutre en l'air avec des modif dans le tableau
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ));

const Item = ({ item, onRemoveItem }) => (
  <div>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}> {/* bouton de suppresion pour un item de la liste méthode d'implémentation la plus simple a implémenter mais plus difficile à débugger a cause de JSX*/}
        Dismiss
      </button>
    </span>
  </div>
);

export default App;
