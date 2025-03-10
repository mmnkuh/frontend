import { attach, createEffect, createEvent, createStore, guard, restore, sample } from 'effector';
import { debounce } from 'patronum/debounce';
import { ChangeEvent } from 'react';

import { historyPush } from '@box/entities/navigation';
import { userModel } from '@box/entities/user';
import { paths } from '@box/pages/paths';
import { Card, User, internalApi } from '@box/shared/api';

export const searchFieldChanged = createEvent<ChangeEvent<HTMLInputElement>>();

export const searchValueChanged = createEvent<string>();
export const $searchValue = restore(searchValueChanged, '');

export const cardsSearchFx = attach({ effect: internalApi.cardsSearch });
export const $cardList = createStore<Card[]>([]);
export const $cardsCount = createStore<number>(0);

export const usersSearchFx = attach({ effect: internalApi.usersSearch });
export const $userList = createStore<User[]>([]);
export const $usersCount = createStore<number>(0);

export const searchFx = createEffect(async (query: string) => {
  const cards = await cardsSearchFx({ body: { query } });
  const users = await usersSearchFx({ body: { query } });
  return {
    cards: cards.answer.cards as Card[],
    users: users.answer.users as User[],
  };
});

sample({
  source: searchFieldChanged.map((event) => event.target.value),
  target: searchValueChanged,
});

const searchDebounced = debounce({
  source: searchValueChanged,
  timeout: 350,
});

const searchSubmitted = guard({
  clock: searchDebounced,
  source: $searchValue,
  filter: (query) => query.trim().length > 0,
});

const trimmedSearchSubmitted = searchSubmitted.map((query) => query.trim());

sample({
  source: trimmedSearchSubmitted.map(paths.search),
  target: historyPush,
});
sample({
  source: trimmedSearchSubmitted,
  target: searchFx,
});

$cardList.on(searchFx.doneData, (_, { cards }) => cards);
$userList.on(searchFx.doneData, (_, { users }) => users);
$cardsCount.on(searchFx.doneData, (_, { cards }) => cards.length);
$usersCount.on(searchFx.doneData, (_, { users }) => users.length);

// FIXME: move logic to entities level?
sample({
  source: cardsSearchFx.doneData,
  fn: ({ answer }) => answer.users as User[],
  target: userModel.updateMap,
});
