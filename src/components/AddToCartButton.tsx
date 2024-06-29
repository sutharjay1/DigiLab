import { Product } from "@/payload-types";

interface AddToCartButtonProps {
  product: Product;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  return <div>AddToCartButton</div>;
};

export default AddToCartButton;
