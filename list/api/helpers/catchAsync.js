// Typing the argument for myFn more strictly, depending on the expected request types.
export const catchAsync = (myFn) => {
    return (req, res, next) => {
        myFn(req, res, next).catch(next); // Catch async errors and pass them to next
    };
};
