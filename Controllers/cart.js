import { Cart } from "../Models/CartSchema.js"
// add to cart api
export const addToCart = async (req, res) => {
    const { productId, title, price, qty,size, imgSrc,preBooking } = req.body;
    const userId = req?.user;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].qty += qty;
            cart.items[itemIndex].price += price;
        } else {
            cart.items.push({ productId, title, price, qty,size, imgSrc,preBooking });
        }
        const Result = await cart.save();
        return res.json({ message: "Item added to cart successfully", success: true, Result }); // Added return
    } catch (error) {
        return res.json({ message: "Error in adding items to cart", success: false, ErrorMessage: error.message }); // Added return
    }
}

// get user cart
export const userCart = async (req, res) => {
    const userId = req?.user;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.json({ message: "Cart not found", success: false });
        }
        return res.json({ message: "Cart found successfully", success: true, cart }); // Added return
    } catch (error) {
        return res.json({ message: "Error in finding user cart", success: false, ErrorMessage: error.message }); // Added return
    }
}

// remove product from cart
export const removeProductfromcart = async (req, res) => {
    const productId = req.params.productId;
    const userId = req?.user;
    if (!productId) {
        return res.status(401).json({ message: "Product id not avaliable", success: false });
    };
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };
    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) return res.json({ message: "Cart not found", success: false }); // Corrected message key and added success

        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

        const result = await cart.save();
        return res.json({ message: "Product removed from cart successfully", success: true, result }); // Added return
    } catch (error) {
        return res.json({ message: "Error in deleting user cart item", success: false, ErrorMessage: error.message }); // Added return
    }
}

// clear cart
export const clearcart = async (req, res) => {
    const userId = req?.user;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };
    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        cart.items = [];
        const result = await cart.save();
        return res.json({ message: "Cart cleared successfully", success: true, result }); // Added return
    } catch (error) {
        return res.json({ message: "Error in clearing cart", success: false, ErrorMessage: error.message }); // Added return
    }
}

// decrease qty from cart
export const decreaseQtyFromCart = async (req, res) => {
    const { productId, qty } = req.body;
    const userId = req?.user;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };
    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        };

        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (productIndex === -1) {
            return res.json({ message: "Product not found in cart", success: false }); // Added return and success false
        }

        const item = cart.items[productIndex];

        if (item.qty > qty) {
            const pricePerUnit = item.price / item.qty;

            item.qty -= qty;
            item.price -= pricePerUnit * qty;
        } else {
            cart.items.splice(productIndex, 1);
        }

        const result = await cart.save();
        return res.json({ message: "Quantity decreased successfully", success: true, result }); // Added return
    } catch (error) {
        return res.json({ message: "Error in decreasing qty.", success: false, ErrorMessage: error.message }); // Added return
    }
}
