import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  register as registerThunk,
  signOut as signOutThunk,
  selectReady,
  selectUser,
} from "./authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const ready = useAppSelector(selectReady);

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      try {
        await dispatch(registerThunk(input)).unwrap();
      } catch (caught) {
        throw caught;
      }
    },
    [dispatch],
  );

  const signOut = useCallback(async () => {
    await dispatch(signOutThunk()).unwrap();
  }, [dispatch]);

  return { user, ready, register, signOut };
}
