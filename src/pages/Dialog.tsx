
type DialogProps = {
  message: string,
  buttons: any[],
  onChoose: (id: number)=>any,
  onClose: ()=>void,
}
export const Dialog = ({
  message,
  buttons,
  onChoose,
  onClose,
}: DialogProps) => {
  return (
    <div className="dialog">
      <p>{message}</p>
      <div className="dialogButtons">
        {buttons.map(({ id, text }) => (
          <button
            type = "button"
            onClick={() => {
              onChoose(id);
              onClose();
            }}
            id={id}
            key={id}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
