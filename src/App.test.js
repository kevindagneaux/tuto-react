import React from 'react';

import App, { // import de tout mes component et reducer
  storiesReducer,
  Item,
  List,
  SearchForm,
  InputWithLabel,
} from './App';

import {
  render,
  screen,
  fireEvent,
  act,
  } from '@testing-library/react';

describe("test tuto", () => { // une description clair du test c'est le "test suite"
  test("true to be true", () => { // ce que l'ont test c'est le "test case"
    expect(true).toBe(true); // TRADUCTION DU TEST: expect -> on attend de ///// (true) ///// .toBe -> qu'il doit-être ///// (true)
  });
  test("false to be false", () => {
    expect(false).toBeFalsy(); // TRADUCTION DU TEST: expect -> on attend de ///// (false) ///// .toBeFalsy -> qu'il doit-être faux
  });
});

/* 
TEST UNITAIRE D'UNE FONCTION JAVASCRIPT
*/

const storyOne = { // juste pour faire en sorte d'avoir de quoi tester sans faire appelle a l'api ce qui rajouterais du temps et un test unitaire ce doit d'aller vite 
  title: "React",
  url: "https://reactjs.org/",
  author: "Jordan Walke",
  num_comments: 3,
  points: 4,
  objectID: 0,
};

const storyTwo = {
  title: "Redux",
  url: "https://redux.js.org/",
  author: "Dan Abramov, Andrew Clark",
  num_comments: 2,
  points: 5,
  objectID: 1,
};

const stories = [storyOne, storyTwo];

describe("/// T-U fonction JS /// storiesReducer", () => { // la fonction reducer prend un etat et une action et retourne un nouveaux etat
  test("supprime une story de toutes les stories", () => {
    const action = { type: 'REMOVE_STORY', payload: storyOne }; // on définis l'action, son type 'remove story', et ont lui met un payload pour qu'il soit définis sur 'storyOne'
    const state = { data: stories, isLoading: false, isError: false }; // sont etat c'est les data de la stories, je définis isLoading et isError sur false pour les besoins du test

    const newState = storiesReducer(state, action); // définition de newState storiesReductceurs a maintenant le state et l'action définis plus haut

    const expectedState = { // l'expectedState va avoir une storis de moins car c'est comme cela que l'ont veux que sa marche, si storiesReducer c'est lancer, ont doit avoir une stories de moins
      data: [storyTwo],
      isLoading: false,
      isError: false,
    };

    expect(newState).toStrictEqual(expectedState); // une fois que la fonction storiesReducer c'est résolue ont doit avoir une stories de moins, donc il ne reste qu'une seule storie (storyTwo) et storyReducer doit être définis dessus pas defaut 
  });
});

/* 
FIN DU TEST UNITAIRE D'UNE FONCTION JAVASCRIPT
*/

/* 
TEST UNITAIRE D'UN COMPONENT
*/

describe("/// T-U component /// Item", () => { // je veux faire un render du component comme un element et lui passer un objet 'item'
  test("render toutes les propriéter", () => {
    render(<Item item={storyOne} />);

    expect(screen.getByText('Jordan Walke')).toBeInTheDocument(); // ont demande a vérifier que jodan walke et bien dans le screen text
    expect(screen.getByText('React')).toHaveAttribute( // ont demande a vérifier que react a bien un attribut href avec cette urls
      'href',
      'https://reactjs.org/'
    );
  });

test('render un bouton supprimer clickable', () => {
  render(<Item item={storyOne} />);

  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('clicker sur le bouton supprimer apelle le callback', () => {
  const handleRemoveItem = jest.fn();

  render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);

  fireEvent.click(screen.getByRole('button'));

  expect(handleRemoveItem).toHaveBeenCalledTimes(1);
});
});

describe('/// T-U Form /// SearchForm', () => {
const searchFormProps = {
  searchTerm: 'React',
  onSearchInput: jest.fn(),
  onSearchSubmit: jest.fn(),
};

test('render le champs input avec sa value', () => {
  render(<SearchForm {...searchFormProps} />);

  expect(screen.getByDisplayValue('React')).toBeInTheDocument();
});

test('Apelle onSearchInput quand le champ input change', () => {
  render(<SearchForm {...searchFormProps} />);

  fireEvent.change(screen.getByDisplayValue('React'), {
    target: { value: 'Redux' },
  });

  expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
});

test('Apelle onSearchSubmit au click sur envoyer', () => {
  render(<SearchForm {...searchFormProps} />);

  fireEvent.submit(screen.getByRole('button'));

  expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
});
});

/* 
FIN DU TEST UNITAIRE D'UN COMPONENT
*/

