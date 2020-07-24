import React from 'react';

const initialStories = [ // constante contenant les stories, quand ont filtre la liste avec InputWithLabel, la liste reste intacte
  {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0, // pour éviter tout futur probleme dans des recheche ou affichage 
  },
  {
    title: "Redux",
    url: "https://redux.js.org/",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => // fonction asynchrone pour simuler la récupération de donnée depuis une API externe, pour un meilleur rendu j'ai rajouter du délay pour pas que se soit instantannée.
  new Promise(resolve => 
    setTimeout(
      () => resolve({ data: {stories: initialStories } }), // ici ont établie une promesse ce qui veux dire que l'ont autorise une génération vide et que des data viendront remplie la génération plus tard
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

const App = () => { // TRADUCTION DU CODE: "const" -> la constante     "App" -> App     "=" -> est        "()"-> une fonction *** peux aussi s'écrire: "function App()" mais ont fait du React la donc ont utilise au plus les composants stateless quand c'est possible

  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search', // ici ont a remplacer key du hook personnalisé par search 
    'React' // et la c'est l'état initiale du hook personnalisé 
    );

  const [stories, setStories] = React.useState([]); // ont part d'un tableau vide pour simuler une récupération de donnée depuis une API externe
  const [isLoading, setIsLoading] = React.useState(false); // chargement pour l'utilisateur en attendant ces data provenant d'API
  const [isError, setIsError] = React.useState(false); // message d'erreur si la récupération des data échoue, je vais pas l'utiliser mais tout les méthode asynchrone doivent en posséder une.

  React.useEffect(() => {
    setIsLoading(true); // le message de chargement s'affiche

    getAsyncStories().then(result => { // ici j'apelle la fonction getAsyncStories et je résous la promise, a cause du tableau vide, le side-effect se realisera qu'une seule fois au premier rendu du component
      setStories(result.data.stories);
      setIsLoading(false); // le message de chargement part
    })
    .catch(() => setIsError(true)); // le message d'erreur s'affiche SI il y a une erreur
  }, []);

  const handleRemoveStory = item => { // Suppression d'un item de la liste
    const newStories = stories.filter(
      story => item.objectID !== story.objectID
    );

    setStories(newStories);
  };
 
  const handleSearch = event => { // lorsque l'ont va taper quelque chose dans la recherche il va nous resortir un log dans la console c'est ce que l'ont apelle un synthetic event
    console.log(event.target.value); 
    setSearchTerm(event.target.value); // handler callback pour repasser les infos ecrite depuis le component search dans App por appliquer le filtre de recherche
  };  

  const searchedStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) // fonction du filtre avec un lowerCase pour faciliter la recheche
  );

  return (
    // ici ont ne fait pas la syntaxe concise comme sur le component list car ont doit avoir un block body pour utiliser onhange handlers
    <div>
      <h1>Documentation</h1>

      <InputWithLabel // ont fait sa car si ont a un autre champs de recherche sur la page étant donner que la combinaison htmlFor et id et dupliquer ont peut avoir des bugs
        id="search"
        label="Search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Rechercher:</strong> {/* premier enfant de 'inputWithLabel' */}
      </InputWithLabel>

      <hr />

      {isError && <p>Une erreur est survenue, réessayer plus tard . . .</p>} {/* avec react '&&' est trés pratique, si la condition est true l'expression aprés le '&&' est sortie, si c'est false React ignore totalement l'expression */}

      {isLoading ? ( // affichage pendant le chargment des data si setIsLoading est true
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

   
  const List = ({ list, onRemoveItem }) => // component List qui récupere des infos de la constante stories
    list.map(item => (
      <Item
        key={item.objectID}  // ici ont prend L'objectId et pas l'index dans le tableux sinon sa peut tout foutre en l'air avec des modif dans le tableau 
        item={item}
        onRemoveItem={onRemoveItem} 
      />
    ));

  const Item = ({ item, onRemoveItem }) => { // component item

    return (
      <div>
        <span>
          <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
        <span>
          <button type="button" onClick={() => onRemoveItem(item)}> {/* bouton de suppresion pour un item de la liste méthode d'implémentation la plus simple a implémenter mais plus difficile à débugger a cause de JSX*/}
            Supprimer
          </button>
        </span>
      </div>
    );
  };

  const InputWithLabel = ({ // pour éviter d'avoir a taper 'props.' sinon ont devrais taper 'value={props.value}' et 'onChange={props.onInputChange}'
    id,
    value,
    type = "text",
    onInputChange,
    isFocused,
    children,
  }) => (
    <> {/* "<>" et "</>" sont des input wrap sa permet de pas avoir a marquer div ou span par exemple, je suis pas fan de cette syntaxe mais sa a le mérite d'être autoriser en JSX */}
      <label htmlFor={id}>{children}</label> {/* Utilisation du premier enfant de inputWithLabel pour l'affichage du champs de recherche */}
      &nbsp;
      <input 
        id={id} 
        type={type} 
        value={value} 
        autoFocus={isFocused} // il s'agit d'un impératif, si j'avais plusieurs fois ce component dans ma page 'autoFocus' s'appliquerais uniquement sur le derniers component générer 
        onChange={onInputChange} /> {/* handler callback pour passer les informations au component App */}
    </>
  );


export default App;
