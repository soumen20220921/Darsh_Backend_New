import { Address } from "../Models/AddressSchema.js";


// Add address
export const addAddress = async (req, res) => {
    const { FullName, Add, VillorCity, Dist, State, Pin, Phone } = req.body;
    const userId = req.user?._id; // Ensure the user is authenticated

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };

    try {
        const add = await Address.findOne({ userId });
        if (add) {
            res.json({ success: false, message: "You already have an address.You can edit your address" });
        } else {
            const address = await Address.create({
                userId,
                FullName,
                Add,
                VillorCity,
                Dist,
                State,
                Pin,
                Phone
            });
            res.status(201).json({ message: "Address Added Successfully", address });
        }

    } catch (error) {
        console.error('Error in adding address:', error); // Log the error for debugging
        res.status(500).json({ message: "Error in adding Address", success: false, error: error.message });
    }
}


// Get address by ID
export const getAddressByID = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated", success: false });
    };
    // console.log(userId)
    try {
        const address = await Address.findOne({ userId });
        // console.log(address)
        if (!address) {
            return res.json({ message: "Address not found", success: false });
        }
        res.status(200).json({ message: "Address Found", address });
    } catch (error) {
        res.status(500).json({ message: "Error in finding Address", success: false, error: error.message });
    }
}

// Update address
export const updateAddress = async (req, res) => {
    const id = req.params?.id; // Assuming req.user contains the authenticated user's data
    if (!id) {
        return res.status(401).json({ message: "Invalid Id", success: false });
    };

    try {
        const address = await Address.findByIdAndUpdate(id, req.body, { new: true });
        if (!address) {
            return res.status(404).json({ message: "Address not found", success: false });
        }
        res.status(200).json({ message: "Update Address Successfully", address });
    } catch (error) {
        res.status(500).json({ message: "Error in updating Address", success: false, error: error.message });
    }
}
