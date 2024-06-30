"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import CartItem from "./CartItem";
import { ScrollArea } from "./ui/scroll-area";

const Cart = () => {
  const { items } = useCart();
  const itemCount = items.length;

  const fee = 9.8;

  const cartTotal = items.reduce(
    (total, { product }) => total + product.price,
    0
  );

  return (
    <>
      <Sheet>
        <SheetTrigger className="group -m-2 flex items-center p-2">
          <ShoppingCartIcon
            aria-hidden="true"
            className="h-6 w-6 flex-shrink-0 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700"
          />
          <span className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-400 group-hover:text-zinc-800">
            {/* {isMounted ? itemCount : 0} */} {itemCount}
          </span>
        </SheetTrigger>
        <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
          <SheetHeader className="space-y-2.5 pr-6">
            <SheetTitle>Cart ({itemCount})</SheetTitle>
          </SheetHeader>
          {itemCount > 0 ? (
            <>
              <div className="flex w-full flex-col pr-6">
                <ScrollArea>
                  {items.map(({ product }) => (
                    <CartItem product={product} key={product.id} />
                  ))}
                </ScrollArea>
              </div>
              <div className="space-y-4 pr-6">
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex">
                    <span className="flex-1">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex">
                    <span className="flex-1">Transaction Fee</span>
                    <span>{formatPrice(fee)}</span>
                  </div>
                  <div className="flex">
                    <span className="flex-1">Total</span>
                    <span>{formatPrice(cartTotal + fee)}</span>
                  </div>
                </div>

                <SheetFooter>
                  <SheetTrigger asChild>
                    <Link
                      href="/cart"
                      className={buttonVariants({
                        className: "w-full",
                      })}
                    >
                      Continue to Checkout
                    </Link>
                  </SheetTrigger>
                </SheetFooter>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-1">
              <div
                aria-hidden="true"
                className="relative mb-4 h-60 w-60 text-muted-foreground"
              >
                <Image
                  src="/not-found-light.svg"
                  fill
                  alt="empty shopping cart hippo"
                  draggable="false"
                  className="dark:hidden"
                />
                <Image
                  src="/not-found-dark.svg"
                  fill
                  alt="empty shopping cart hippo"
                  draggable="false"
                  className="hidden dark:block"
                />
              </div>
              <div className="text-xl font-semibold">Your cart is empty</div>
              <SheetTrigger asChild>
                <Link
                  href="/products"
                  className={buttonVariants({
                    variant: "link",
                    size: "sm",
                    className: "text-sm text-muted-foreground",
                  })}
                >
                  Add items to your cart to checkout
                </Link>
              </SheetTrigger>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Cart;
