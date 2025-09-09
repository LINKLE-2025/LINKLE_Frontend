// src/components/modal/useActionMenu.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ActionItem =
  | {
    id: string;
    label: string;
    type: "link";
    href: string; // 내부 라우트 or 외부 링크
    state?: any;
    icon?: React.ReactNode;
    danger?: boolean;
  }
  | {
    id: string;
    label: string;
    type: "fetch";
    request: {
      url: string;
      method?: Method;
      body?: any;
      headers?: Record<string, string>;
    };
    icon?: React.ReactNode;
    danger?: boolean;
  }
  | {
    id: string;
    label: string;
    type: "callback";
    onClick: () => Promise<any> | any;
    icon?: React.ReactNode;
    danger?: boolean;
  };

export interface ActionMenuOptions {
  title?: string;               // 상단 타이틀(선택)
  message?: string;             // 중앙 본문(선택) → 2버튼 확인형에 유용
  actions: ActionItem[];        // 1~N
  cancelText?: string;          // 기본: "취소" (없으면 취소 버튼 숨김)
  showBack?: boolean;
  onBack?: () => void;
  closeOnOverlay?: boolean;     // 기본: true
}

interface InternalState extends ActionMenuOptions {
  isOpen: boolean;
  resolver?: (result: { pickedId?: string; data?: any } | null) => void;
}

export function useActionMenu() {
  const [state, setState] = useState<InternalState>({
    isOpen: false,
    actions: [],
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  const open = (opts: ActionMenuOptions) =>
    new Promise<{ pickedId?: string; data?: any } | null>((resolve) => {
      setState({
        isOpen: true,
        cancelText: "취소",
        closeOnOverlay: true,
        ...opts,
        resolver: resolve,
      });
    });

  const close = (result: { pickedId?: string; data?: any } | null = null) => {
    state.resolver?.(result);
    setBusyId(null);
    setState((s) => ({ ...s, isOpen: false }));
  };

  // 레이아웃: actions 길이가 2면 좌우, 아니면 세로
  const layout: "two" | "threePlus" = useMemo(
    () => (state.actions.length === 2 ? "two" : "threePlus"),
    [state.actions.length]
  );

  // ESC 닫기
  useEffect(() => {
    if (!state.isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.isOpen]);

  const handleAction = async (action: ActionItem) => {
    try {
      setBusyId(action.id);

      if (action.type === "link") {
        // 내부 라우트 vs 외부 링크
        if (/^https?:\/\//i.test(action.href)) {
          window.location.href = action.href;
        } else {
          navigate(action.href, { state: action.state });
        }
        close({ pickedId: action.id });
        return;
      }

      if (action.type === "fetch") {
        const { url, method = "POST", headers, body } = action.request;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...(headers || {}) },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const data = await (async () => {
          try {
            return await res.json();
          } catch {
            return await res.text();
          }
        })();
        close({ pickedId: action.id, data });
        return;
      }

      if (action.type === "callback") {
        const data = await action.onClick();
        close({ pickedId: action.id, data });
        return;
      }
    } finally {
      setBusyId(null);
    }
  };

  // === 포털 요소 (요소 또는 null) ===
  const ActionMenu = state.isOpen
    ? createPortal(
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={state.closeOnOverlay ? () => close(null) : undefined}
        />
        {/* Container */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md rounded-t-2xl bg-white p-4 shadow-2xl">
          {/* Header */}
          {(state.title || state.message) && (
            <div className="mb-3 flex items-center justify-between">
              <div className="w-9 h-9" />
              {/* 타이틀 or 빈자리 */}
              <div className="text-sm font-semibold">
                {state.title ?? ""}
              </div>
              <button
                onClick={() => close(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Message (센터 텍스트) */}
          {state.message && (
            <div className="mb-3 text-center text-base">
              {state.message}
            </div>
          )}

          {/* Body: actions */}
          {layout === "two" ? (
            // 2개: 좌우 버튼
            <div className="grid grid-cols-2 gap-2">
              {state.actions.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleAction(a)}
                  disabled={busyId === a.id}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm ${a.danger
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                    } disabled:opacity-60`}
                >
                  {("icon" in a && a.icon) || null}
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          ) : (
            // 3개 이상: 세로 스택
            <div className="space-y-2">
              {state.actions.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleAction(a)}
                  disabled={busyId === a.id}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${a.danger
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    } disabled:opacity-60`}
                >
                  <span className="flex items-center gap-2">
                    {("icon" in a && a.icon) || null}
                    <span>{a.label}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 뒤로 버튼 (옵션) */}
          {/* {state.showBack && (
              <button
                onClick={state.onBack}
                className="mt-2 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm text-gray-600"
              >
                <span className="flex items-center gap-2">
                  <ChevronLeft className="h-5 w-5" />
                  <span>뒤로</span>
                </span>
              </button>
            )} */}

          {/* 취소 버튼 (있을 때만 표시) */}
          {state.cancelText && (
            <button
              onClick={() => close(null)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
            >
              {state.cancelText}
            </button>
          )}
        </div>
      </div>,
      document.body
    )
    : null;

  // === 확인형 헬퍼 ===
  type ConfirmAction =
    | { type: "link"; href: string; danger?: boolean }
    | {
      type: "fetch";
      request: { url: string; method?: Method; body?: any; headers?: Record<string, string> };
      danger?: boolean;
    }
    | { type: "callback"; run: () => Promise<any> | any; danger?: boolean };

  async function confirm(opts: {
    message: string;
    confirmText?: string;
    cancelText?: string;
    closeOnOverlay?: boolean; // 기본 false 추천 (실수 방지)
    action?: ConfirmAction;    // 없으면 단순 확인/취소만 반환
    title?: string;            // 필요 시 타이틀도 함께
  }): Promise<{ confirmed: boolean; data?: any }> {
    const confirmLabel = opts.confirmText ?? "확인";
    const cancelLabel = opts.cancelText ?? "취소";
    const actions: ActionItem[] =
      opts.action
        ? opts.action.type === "link"
          ? [
            {
              id: "confirm",
              label: confirmLabel,
              type: "link",
              href: opts.action.href,
              danger: opts.action.danger,
            },
          ]
          : opts.action.type === "fetch"
            ? [
              {
                id: "confirm",
                label: confirmLabel,
                type: "fetch",
                request: opts.action.request,
                danger: opts.action.danger,
              },
            ]
            : [
              {
                id: "confirm",
                label: confirmLabel,
                type: "callback",
                onClick: opts.action.run,
                danger: opts.action.danger,
              },
            ]
        : [
          // 액션 없으면 “확인” 누르면 그냥 true 반환
          {
            id: "confirm",
            label: confirmLabel,
            type: "callback",
            onClick: () => true,
          },
        ];

    const res = await open({
      title: opts.title,            // 선택
      message: opts.message,        // 중앙 텍스트
      actions,                      // 1개 + cancel → layout === "two" 만족 위해 아래에서 하나 더 붙임
      // 두 버튼(확인/취소)로 만들기 위해 actions가 1개일 때 cancelText를 통해 2버튼 UI가 됨
      cancelText: cancelLabel,
      closeOnOverlay: opts.closeOnOverlay ?? false,
    });

    return { confirmed: !!res?.pickedId, data: res?.data };
  }

  return { open, confirm, ActionMenu };
}
