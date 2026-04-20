import { useAppSelector } from "../features/redux/hooks.js";

export const PromptError = () => {
  const error = useAppSelector(({ script: { error } }) => error);

  return (
    <tbody key="error">
      <tr>
        <td colSpan={2}>
          {error && error.description}
        </td>
      </tr>
    </tbody>
  );
};
