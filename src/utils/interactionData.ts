export type GoalResponse = {
  name: string;
  type: number;
  value: string;
};

export const transformInteractionData = (interactionData: GoalResponse[]) => {
  const res: { [key: string]: string } = {};
  interactionData.forEach((ele) => {
    res[ele.name] = ele.value;
  });
  return res;
};
