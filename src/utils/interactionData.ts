export type InteractionResponse = {
  name: string;
  type: number;
  value: string;
};

export const transformInteractionData = (
  interactionData: InteractionResponse[]
) => {
  const res: { [key: string]: string } = {};
  interactionData.forEach((ele) => {
    res[ele.name] = ele.value;
  });
  return res;
};
