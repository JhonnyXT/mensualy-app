'use client';

// El teléfono de la portada: Mensualy con datos de ejemplo, funcionando. Cada
// pantalla es una réplica de la app (`phone/*`) a 390 px lógicos, escalada al
// marco por `PhoneFrame`.

import { useCallback } from 'react';
import { PhoneFrame } from '@/components/PhoneFrame';
import { Banner } from './phone/Banner';
import { Dashboard } from './phone/Dashboard';
import { CancelSheet, DetailSheet } from './phone/DetailSheet';
import { NewSheet } from './phone/NewSheet';
import { suggestionsFor } from './suggestions';
import { activeSubs, isZombie, type DemoApi } from './useDemo';

export function DemoPhone({ api }: { api: DemoApi }) {
  const { state, dispatch } = api;
  const active = activeSubs(state);
  const sheet = state.sheet;
  const sheetSub = sheet && sheet.kind !== 'new' ? state.subs.find((s) => s.id === sheet.id) : undefined;
  const bannerSub = state.banner ? state.subs.find((s) => s.id === state.banner!.id) : undefined;

  const hideBanner = useCallback(() => dispatch({ type: 'hideBanner' }), [dispatch]);
  const finishCancel = useCallback(() => dispatch({ type: 'finishCancel' }), [dispatch]);

  return (
    <PhoneFrame>
      <Dashboard
        subs={active}
        suggestions={suggestionsFor(active, state.dismissed)}
        onOpen={(id) => dispatch({ type: 'openDetail', id })}
        onAdd={() => dispatch({ type: 'openNew' })}
        onDismiss={(id) => dispatch({ type: 'dismiss', id })}
      />
      {sheet?.kind === 'new' && <NewSheet onClose={() => dispatch({ type: 'close' })} onCreate={(input) => dispatch({ type: 'add', input })} />}
      {sheet?.kind === 'detail' && sheetSub && (
        <DetailSheet
          key={sheetSub.id}
          sub={sheetSub}
          zombie={isZombie(sheetSub, state)}
          onClose={() => dispatch({ type: 'close' })}
          onMarkUsed={() => dispatch({ type: 'markUsed', id: sheetSub.id })}
          onCancel={() => dispatch({ type: 'askCancel', id: sheetSub.id })}
        />
      )}
      {sheet?.kind === 'cancel' && sheetSub && (
        <CancelSheet
          sub={sheetSub}
          done={sheet.done}
          onKeep={() => dispatch({ type: 'openDetail', id: sheetSub.id })}
          onConfirm={() => dispatch({ type: 'confirmCancel' })}
          onFinish={finishCancel}
        />
      )}
      {state.banner && bannerSub && <Banner sub={bannerSub} n={state.banner.n} onTap={() => dispatch({ type: 'tapBanner' })} onHide={hideBanner} />}
    </PhoneFrame>
  );
}
