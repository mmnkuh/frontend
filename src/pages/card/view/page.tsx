import { createEvent, createStore } from 'effector';
import { useEvent, useStore } from 'effector-react/scope';
import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CardPreview } from '@box/entities/card';
import { UserCard } from '@box/entities/user';
import { Card, User } from '@box/shared/api/index';
import { breakpoints } from '@box/shared/lib/breakpoints';
import { theme } from '@box/shared/lib/theme';
import { Button, ContentCenteredTemplate, Empty, IconDeckCheck, IconEdit } from '@box/shared/ui';

import { paths } from '../../paths';

// eslint-disable-next-line prettier/prettier
const DELETE_WARN = 'Are you sure you want to delete this card?';

export const $currentCard = createStore<Card | null>(null);
export const $pagePending = createStore(false);
export const $pageTitle = createStore('');
export const $cardAuthor = createStore<User | null>(null);
export const $isAuthorViewing = createStore(false);

export const deleteCard = createEvent();

export const CardViewPage = () => {
  const card = useStore($currentCard);
  const isLoading = useStore($pagePending);
  const pageTitle = useStore($pageTitle);
  const author = useStore($cardAuthor);
  const isAuthorViewing = useStore($isAuthorViewing);

  const handleDeleteCard = useEvent(deleteCard);

  if (!card && !isLoading) {
    return (
      <Empty text="Sorry, the page you visited does not exist.">
        <LinkHome to={paths.home()}>Back Home</LinkHome>
      </Empty>
    );
  }

  return (
    <>
      <Helmet title={pageTitle} />
      <ContentCenteredTemplate>
        <Container>
          <Main>
            {card && author && <CardPreview card={card} loading={isLoading} size="large" />}
            {/* TODO: Process "empty" case correctly */}
          </Main>
          <Sidebar>
            {author && <UserCard user={author} />}
            {card && isAuthorViewing && (
              <Buttons>
                <Link to={paths.cardEdit(card.id)}>
                  <ButtonCard
                    type="button"
                    theme="secondary"
                    variant="outlined"
                    icon={<IconEdit />}
                  >
                    <span>Edit card</span>
                  </ButtonCard>
                </Link>
                <ButtonCard
                  type="button"
                  theme="danger"
                  variant="outlined"
                  icon={<IconDeckCheck />}
                  onClick={() => {
                    // FIXME: replace to UIKit implementation later
                    // eslint-disable-next-line no-alert
                    if (!window.confirm(DELETE_WARN)) return;
                    handleDeleteCard();
                  }}
                >
                  <span>Delete card</span>
                </ButtonCard>
              </Buttons>
            )}
          </Sidebar>
        </Container>
      </ContentCenteredTemplate>
    </>
  );
};

const map = (props: { disabled?: boolean }) => ({
  'data-disabled': props.disabled,
});

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 126px 126px 126px;

  & > *:first-child {
    margin-right: 2.25rem;
  }

  ${breakpoints.devices.laptop} {
    padding: 0 18px;
  }

  ${breakpoints.devices.mobile} {
    flex-direction: column-reverse;

    & > *:first-child {
      margin-right: 0;
    }
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Sidebar = styled.div`
  flex-shrink: 0;
  width: 324px;

  & > *:first-child {
    margin-bottom: 1.625rem;
  }

  ${breakpoints.devices.mobile} {
    width: auto;
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.625rem;

    & > *:first-child {
      margin-bottom: 0;
    }
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 0.5625rem;
  }

  a {
    text-decoration: none;
  }

  ${breakpoints.devices.mobile} {
    flex-direction: row;

    & > *:not(:last-child) {
      margin-bottom: 0;
    }
  }
`;

const ButtonCard = styled(Button)`
  justify-content: flex-start;
  width: 100%;

  ${breakpoints.devices.mobile} {
    width: 54px;
    height: 48px;

    &:first-child {
      margin-right: 10px;
    }

    span:nth-of-type(2) {
      display: none;
    }
  }
`;

const LinkHome = styled(Link)`
  --base-color: var(${theme.palette.wizard500});

  color: var(--base-color);
  margin-top: 2rem;
  &:hover {
    opacity: 0.7;
  }
`;
