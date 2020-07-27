import React from 'react';

const initialStories = [ // constante contenant les stories, quand ont filtre la liste avec InputWithLabel, la liste reste intacte
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0, // pour éviter tout futur probleme dans des recheche ou affichage 
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => // fonction asynchrone pour simuler la récupération de donnée depuis une API externe, pour un meilleur rendu j'ai rajouter du délay pour pas que se soit instantannée.
  new Promise(resolve =>
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),// ici ont établie une promesse ce qui veux dire que l'ont autorise une génération vide et que des data viendront remplie la génération plus tard
      2000 // délaie juste pour faire genre ont récupere vraiment des donées d'une autre API, si ont veux l'enlever il suffit de supprimer le setTimeout, le délaie de 2000 et '() =>' devant le resolve
    )
  );

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

  const [stories, dispatchStories] = React.useReducer( // tableau vide pour récuperation des data, dispatchstories va me servir a générer l'etat de mes actions et le resultat qui va en découller
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  React.useEffect(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    getAsyncStories() // ici j'apelle la fonction getAsyncStories et je résous la promise, a cause du tableau vide, le side-effect se realisera qu'une seule fois au premier rendu du component
      .then(result => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.data.stories,
        });
      })
      .catch(() =>
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, []);

  const handleRemoveStory = item => { // suppresion d'un item de la liste, avec comme type d'action remove story
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearch = event => { // lorsque l'ont va taper quelque chose dans la recherche il va nous resortir un log dans la console c'est ce que l'ont apelle un synthetic event
    console.log(event.target.value);
    setSearchTerm(event.target.value); // handler callback pour repasser les infos ecrite depuis le component search dans App por appliquer le filtre de recherche
  };

  const searchedStories = stories.data.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) // fonction du filtre avec un lowerCase pour faciliter la recheche
  );

  return (
    <div>
      <h1>Documentation</h1>

      <InputWithLabel // ont fait sa car si ont a un autre champs de recherche sur la page étant donner que la combinaison htmlFor et id et dupliquer ont peut avoir des bugs
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Rechercher:</strong> {/* premier enfant de 'inputWithLabel' */}
      </InputWithLabel>

      <hr />

      {stories.isError && <p>Une erreur est survenue . . .</p>} {/* avec react '&&' est trés pratique, si la condition est true l'expression aprés le '&&' est sortie, si c'est false React ignore totalement l'expression */}

      {stories.isLoading ? (
        <p>Chargement . . .</p>
      ) : (
        <List // appelle du component "List" et ont définis que list est égale a la constante searchedStories qui quand rien n'est filtrer renvoie la liste complete
          list={searchedStories}
          onRemoveItem={handleRemoveStory}
        />
      )}
    </div>
  );
};

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
