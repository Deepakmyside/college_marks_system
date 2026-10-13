const prisma = require("../config/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const login = async (req , res) => {
    try {
        const { username, password} = req.body;

        if(!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and passowrd are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: {username},
        });

        if(!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d"}
        );

        return res.status(200).json({
            success: true,

            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error)  {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = { login };