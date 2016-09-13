args <- commandArgs()
req_term <- as.integer(args[6])
req_ratio <- as.numeric(args[7])

load("/Users/klis/Projects/nostra/pd_scripts/prediction_model.rda")

newdf <- data.frame(term = req_term, paid_amount_ratio = req_ratio)
result <- predict(ctree.model_2, new = newdf)

as.numeric(as.character(result))