library(plyr)
library(dplyr)
library(Hmisc)
library(party)
library(rpart)
library(ROCR)
library(nnet)
set.seed(1)
### datasets are being imported and merged into data frame
DATA_SET <- read.csv("~/Desktop/Lending Club/csv/LoanStats3d.csv")

### DATA_SET$defaulted <- binarna, 0-spłacana 1-niespłacana
DATA_SET$defaulted <- revalue(DATA_SET$loan_status, c("Current" = 0, "Fully Paid" = 0, "In Grace Period" = 0,
                                "Charged Off" = 1, "Default" = 1, "Late (16-30 days)" = 1, "Late (31-120 days)" = 1))
DATA_SET$defaulted <- as.numeric(as.character(DATA_SET$defaulted))

### DATA_SET$reason <- binarna, 0-inny niz splata zaleglych zobowiazan 1-celem byla splata karty kredytowej lub konsolidacja zobowiazan
DATA_SET$reason <- revalue(DATA_SET$purpose, c("car" = 0, "educational" = 0, "home_improvement" = 0, "house" = 0, "major_purchase" = 0,
                                              "medical" = 0, "moving" = 0, "other" = 0, "renewable_energy" = 0, "small_business" = 0, 
                                              "vacation" = 0, "wedding" = 0, "credit_card" = 1, "debt_consolidation" = 1))
DATA_SET$reason <- as.numeric(as.character(DATA_SET$reason))

### DATA_SET$income_verified <- binarna, 0-niezweryfikowany 1-zweryfikowano zrodlo albo kwote
DATA_SET$verified <- revalue(DATA_SET$verification_status, c("Not Verified" = 0, "Source Verified" = 1, "Verified" = 1))
DATA_SET$verified <- as.numeric(as.character(DATA_SET$verified))

### DATA_SET$home_owner <- binarna, 0-nie,wynajmuje albo hipoteka 1-tak
DATA_SET <- DATA_SET[DATA_SET$home_ownership!="ANY", ]
DATA_SET$home_owner <- revalue(DATA_SET$home_ownership, c("MORTGAGE" = 0, "RENT" = 0, "OWN" = 1))
DATA_SET$home_owner <- as.numeric(as.character(DATA_SET$home_owner))

### DATA_SET$emp_tenure <- numeryczna, 0-mniej niz 1 rok, 10-10 lat albo wiecej
DATA_SET <- DATA_SET[DATA_SET$emp_length!="n/a", ]
DATA_SET$emp_tenure <- revalue(DATA_SET$emp_length, c("< 1 year" = 0, "1 year" = 1, "2 years" = 2, "3 years" = 3, "4 years" = 4,
                                                    "5 years" = 5, "6 years" = 6, "7 years" = 7, "8 years" = 8, "9 years" = 9, "10+ years" = 10))
DATA_SET$emp_tenure <- as.numeric(as.character(DATA_SET$emp_tenure))

## wybieram te zmienne, ktore mnie interesują
SELECTED_DATA <- DATA_SET[,c(112, 113, 114, 115, 116, 25, 28, 3, 6, 7, 41, 14)]

SELECTED_DATA$dti <- (SELECTED_DATA$dti/100)
SELECTED_DATA$fraction_prncp_paid_back <- SELECTED_DATA$total_rec_prncp/SELECTED_DATA$loan_amnt
SELECTED_DATA$total_rec_prncp <- NULL
SELECTED_DATA$loan_amnt <- NULL

rcorr(as.matrix(SELECTED_DATA))
summary(SELECTED_DATA$defaulted)

### dzielę zbiór na 3 częsci: uczący, walidacyjny i testowy
LABELS <- rep(rep(c("training", "validation", "test"), c(7,2,1)), len = nrow(SELECTED_DATA))
observation.type <- factor((sample(LABELS, nrow(SELECTED_DATA))))
SPLITTED_DATA <- split(SELECTED_DATA, observation.type)
### liczebnosci zbiorow
nrow(SPLITTED_DATA$training)
nrow(SPLITTED_DATA$validation)
nrow(SPLITTED_DATA$test)

### zapuszczam drzewo ze wszystkimi obserwacjami
ctree.model <- ctree(factor(defaulted) ~ ., data = SPLITTED_DATA$training, controls = ctree_control(mincriterion = 0.99, minsplit = 20000))
plot(ctree.model, tnex = 2, type = "extended")
confusion.matrix <- list()
cat("Macierz trafności ctree")
confusion.matrix[[1]] <- table(predict(ctree.model, new = SPLITTED_DATA$validation), SPLITTED_DATA$validation$defaulted)
confusion.matrix
PROFIT_MATRIX <- matrix(c(3812, 291, -15420, 0), 2)
ctree.profit <- confusion.matrix[[1]]*PROFIT_MATRIX
ctree.profit.per.loan <- sum(ctree.profit)/nrow(SPLITTED_DATA$validation)

### dostosowywanie drzewa
ctree.model_1 <- ctree(factor(defaulted) ~ fraction_prncp_paid_back + factor(term), 
                      data = SPLITTED_DATA$training, controls = ctree_control(mincriterion = 0.9999999999, minsplit = 55000))
plot(ctree.model_1, tnex = 2, type = "extended")
confusion.matrix_1 <- list()
cat("Macierz trafności ctree")
confusion.matrix_1[[1]] <- table(predict(ctree.model_1, new = SPLITTED_DATA$validation), SPLITTED_DATA$validation$defaulted)
confusion.matrix_1[[2]] <- table(predict(ctree.model_1, new = SPLITTED_DATA$test), SPLITTED_DATA$test$defaulted)
confusion.matrix_1[[3]] <- table(predict(ctree.model_1, new = SPLITTED_DATA$training), SPLITTED_DATA$training$defaulted)

ctree_1.profit <- confusion.matrix_1[[1]]*PROFIT_MATRIX
ctree_1.profit.per.loan <- sum(ctree_1.profit)/nrow(SPLITTED_DATA$validation)

### regresja logistyczna
full.logit <- glm(defaulted ~., data =  SPLITTED_DATA$training, family = binomial)
summary(full.logit)

### usuwam zmienne nieistotne statystycznie
trimmed.logit <- glm(defaulted ~ reason + verified + emp_tenure + dti + inq_last_6mths + 
                       term + int_rate + fraction_prncp_paid_back, data = SPLITTED_DATA$training, family = binomial)
summary(trimmed.logit)

### Estymuję regresję logistyczną z dwoma zmiennymi objaśniającymi użytymi do podziału drzewa klasyfikacyjnego
two.variable.logit <- glm(defaulted ~ fraction_prncp_paid_back + term, data =  SPLITTED_DATA$training, family = binomial)
summary(two.variable.logit)

### Rysuję krzywą ROC dla 2 modeli i wyliczam AUC
predictions <- prediction.object <- roc  <- model <- list()
legend.label <- auc <- NULL
NAMES <- c("Model z 8 zmiennymi", "Model z 2 zmiennymi")
model[[1]] <- trimmed.logit
model[[2]] <- two.variable.logit

pdf("ROC_logit_porownanie.pdf", encoding="CP1250.enc")
for (i in 1:length(model)) {
  predictions[[i]] <- predict(model[[i]], new = SPLITTED_DATA$validation)
  prediction.object[[i]] <- prediction(predictions[[i]],
                                       SPLITTED_DATA$validation$defaulted)
  roc[[i]] <- performance(prediction.object[[i]], "tpr", "fpr")
  auc[i] <- attr(performance(prediction.object[[i]], "auc"), "y.values")
  legend.label[i] <- paste(NAMES[i], "(AUC=", format(auc[i], digits = 4), ")",
                           sep = "")
  plot(roc[[i]], add = (i != 1), col = i + 1)
}
legend("bottomright", legend.label, col = 1 + (1:length(model)),
       title = "Modele", lty = 1)
dev.off()

### Optymalizacja progu odcięcia dla logitów

CalculateProfit <-function(cut.off, profit.matrix, score, true.y){
  prediction <- ifelse(score > cut.off, 1, 0)
  confusion.matrix <- prop.table(table(factor(prediction, levels = c(0, 1)),
                                       true.y))
  return(sum(profit.matrix * confusion.matrix))
}

score <- profits <- list()
model <- two.variable.logit

CUT_OFFS <- seq(0.0, 1, by = 0.01) 

PROFIT_MATRIX <- matrix(c(3812, 291, -15420, 0), 2)
PROFIT_MATRIX
score[[1]] <- predict(model, newdata = SPLITTED_DATA$validation, type = "response")
profits[[1]] <- sapply(CUT_OFFS, CalculateProfit, profit.matrix = PROFIT_MATRIX,
                     score = score[[1]], true.y = SPLITTED_DATA$validation$defaulted)
score[[2]] <- predict(model, type = "response")
profits[[2]] <- sapply(CUT_OFFS, CalculateProfit, profit.matrix = PROFIT_MATRIX,
                     score = score[[2]], true.y = SPLITTED_DATA$training$defaulted)

plot(data.frame(CUT_OFFS, 2690), type = "l", lty = 3, log = "y",
     ylim = range(c(2690, unlist(profits))),
     ylab = "Zysk per pożyczka", xlab = "Próg odcięcia")
for (i in 1:2) {
  lines(CUT_OFFS, profits[[i]], lty = i, lwd = 2)
  points(CUT_OFFS[which.max(profits[[i]])], max(profits[[i]]),
         pch = 19, cex = 1.3)
}

legend("bottomright", c("Walidacyjny", "Uczący", "bez modelu"),
       lty = c(1, 2, 3), cex = .7, ncol = 3,
       lwd = c(2, 2, 1))

max.profit <- max(profits[[1]])
max.profit
cutoff <- CUT_OFFS[which.max(profits[[1]])]
cutoff

prediction1 <- ifelse(score[[1]] > cutoff, 1, 0)
trafnosc1 <- table(prediction1, SPLITTED_DATA$validation$defaulted)
(trafnosc1[1,1] + trafnosc1[2,2]) / sum(trafnosc1)
trafnosc1[2,2]/(trafnosc1[1,2] + trafnosc1[2,2])

prediction2 <- ifelse(score[[2]] > cutoff, 1, 0)
trafnosc2 <- table(prediction2, SPLITTED_DATA$training$defaulted)
(trafnosc2[1,1] + trafnosc2[2,2]) / sum(trafnosc2)
trafnosc2[2,2]/(trafnosc2[1,2] + trafnosc2[2,2])

### Graficzna ocena klasyfikatora

score.or.class <- gain <- lift <- roc <- auc <- prediction.object <- list()
score.or.class[[1]] <- list(SPLITTED_DATA$validation$defaulted, SPLITTED_DATA$validation$defaulted)
score.or.class[[2]] <- list(predict(trimmed.logit, type = "response"),
                            SPLITTED_DATA$training$defaulted)
score.or.class[[3]] <- list(predict(trimmed.logit, new = SPLITTED_DATA$validation, "response"),
                            SPLITTED_DATA$validation$defaulted)
class.average <- mean(SPLITTED_DATA$validation$defaulted)
random.class <- 1
for (i in 1:(nrow(SPLITTED_DATA$validation) - 1)) {
  random.class <- c(random.class, mean(random.class) < class.average)
}
score.or.class[[4]] <- list(seq(0, 1, len = nrow(SPLITTED_DATA$validation)), random.class)

for (i in 1:length(score.or.class)) {
  prediction.object[[i]] <- prediction(score.or.class[[i]][[1]],
                                       score.or.class[[i]][[2]])
  gain[[i]] <- performance(prediction.object[[i]], "tpr", "rpp")
  lift[[i]] <- performance(prediction.object[[i]], "lift", "rpp")
  roc[[i]] <- performance(prediction.object[[i]], "tpr", "fpr")
  auc[[i]] <- performance(prediction.object[[i]], "auc")
}
LEGEND_LABELS <- c("wizard", "train", "validation", "random")
ShowCurve <- function(list, name, AUC = FALSE, legend.position = "right") {
  for (i in 1:length(list)) {
    plot(list[[i]], main = paste("Krzywa", name),
         col = i, lwd = 2, add = (i != 1), xlim = c(0, 1))
    if (AUC) {
      text(.3, 0.2 - i * 0.05, pos = 4, col = i, cex = .8,
           paste("AUC =", round(auc[[i]]@y.values[[1]], digit = 3)))
    }
  }
  legend(legend.position, lty = 1, lwd = 2, col = 1:4,
         y.intersp = .6, legend = LEGEND_LABELS, seg.len = 0.5, bty = "n")
}
par(mfrow = c(2, 2), mar = c(4, 4, 2, 1))
ShowCurve(gain, "Gain", legend.position = "bottomright")
ShowCurve(lift, "Lift", legend.position = "topright")
ShowCurve(roc, "ROC", AUC = TRUE, legend.position = "bottomright")

class0.score.density <- class1.score.density <- list()
max.density <- 0
for(i in 1:(length(prediction.object))) {
  predictions <- prediction.object[[i]]@predictions[[1]]
  labels <- prediction.object[[i]]@labels[[1]]
  class0.score.density[[i]] <- density(predictions[labels == "0"],
                                       kernel =  "epanechnikov", bw = 0.05)
  class1.score.density[[i]] <- density(predictions[labels == "1"],
                                       kernel =  "epanechnikov", bw = 0.05)
  max.density <- max(class0.score.density[[i]]$y,
                     class1.score.density[[i]]$y, max.density)
}   
plot(0, 0, type = "n", xlim = c(-0.1, 1.1), ylim = c(0, max.density),
     xlab = "Score", ylab = "Wartość funkcji gęstości",
     main = "Warunkowe funkcje gęstości score'u")
for(i in 1:length(prediction.object)) {
  lines(class0.score.density[[i]], col = i, lwd = 2)
  lines(class1.score.density[[i]], col = i, lwd = 2, lty = 2)
}
legend("top", lty = 1, lwd = 2, col = 1:4, y.intersp = .6,
       legend = LEGEND_LABELS, seg.len = 0.5, bty = "n")

### Sztuczna sieć neuronowa

## normalizacja zmiennych (wymagana przez sieci neuronowe)
SCALED_DATA_TRAINING <- scale(SPLITTED_DATA$training[-1])
training.nn <- cbind(SPLITTED_DATA$training[1], SCALED_DATA_TRAINING)
SCALED_DATA_VALIDATION <- scale(SPLITTED_DATA$validation[-1])
validation.nn <- cbind(SPLITTED_DATA$validation[1], SCALED_DATA_VALIDATION)
SCALED_DATA_TEST <- scale(SPLITTED_DATA$test[-1])
test.nn <- cbind(SPLITTED_DATA$test[1], SCALED_DATA_TEST)

## siec neuronowa zapuszczana

NEURONS <- 5
DECAYS <- seq(0, 40, length.out = 1)
wts.parameter <-  2 * runif(NEURONS * ncol(training.nn) + NEURONS + 1) - 1
train.error <- valid.error <- numeric(length(DECAYS))
neural.nets <- list()
for (d in 1:length(DECAYS)){
  neural.nets[[d]] <- nnet(factor(defaulted) ~ term + int_rate + fraction_prncp_paid_back, data = training.nn, size = NEURONS,
                           decay = 0, linout = F, maxit = 100000,trace = FALSE)
#  neural.nets[[d]] <- nnet(factor(defaulted) ~ reason + verified + home_owner 
#                           + emp_tenure + dti + inq_last_6mths + term + int_rate + annual_inc
#                           + fraction_prncp_paid_back, data = training.nn, size = NEURONS,
#                           decay = DECAYS[d], linout = F, maxit = 100000,trace = FALSE)
  train.error[d] <- mean(neural.nets[[d]]$residuals ^ 2)
  prediction <- predict(neural.nets[[d]], newdata = validation.nn)
  valid.error[d] <- mean((prediction - validation.nn$defaulted) ^ 2)
  percentage <- d / length(DECAYS)
}

best.neural.net <- neural.nets[[which.min(valid.error)]]
test.prediction <- predict(best.neural.net, newdata = test.nn)
best.net.test.error <- mean((test.prediction - test.nn$defaulted) ^ 2)

ols <- lm(defaulted ~ ., data = training.nn)
ols.train.error <- mean(ols$residuals ^ 2)
prediction <- predict(ols, newdata = validation.nn)
ols.valid.error <- mean((prediction - validation.nn$defaulted) ^ 2)
prediction <- predict(ols, newdata = test.nn)
ols.test.error <- mean((prediction - test.nn$defaulted) ^ 2)

plot(DECAYS, train.error, "l", ylim = range(c(train.error, 0.055)),
     lwd = 2, col = "red", xlab = "Parametr decay", ylab = "MSE")
lines(DECAYS, valid.error, "l", col = "blue", lwd = 2)
points(DECAYS[which.min(valid.error)], min(valid.error),
       pch = 19, col = "blue", cex = 1.5)
points(DECAYS[which.min(valid.error)], best.net.test.error,
       pch = 19, col = "green", cex = 1.5)
abline(h = ols.train.error, col = "red", lty = 2)
abline(h = ols.valid.error, col = "blue", lty = 2)
abline(h = ols.test.error, col = "green", lty = 2)
legend("topright", lty = c(1, 1, NA, 1.5, 1.5, 1.5), lwd = c(1.5, 1.5, NA, 1, 1, 1),
       col = c("red", "blue", "green"), pch = c(NA, NA, 19, NA, NA, NA),
       y.intersp = 0.58, ncol = 2,
       legend = c("Net train", "Net valid", "Net test",
                  "OLS train", "OLS valid", "OLS test"))                                                    
names(training.nn)
devAskNewPage(ask = TRUE)
par(mfrow = c(1, 1), mar = c(2.5, 2.5, 2, 1))
zeros <- data.frame(matrix(0, ncol = ncol(training.nn) - 1, nrow = 100))
names(zeros) <- names(training.nn[-1])  
for(j in 1:ncol(zeros)){
  x.change <- zeros
  x.change[, j] <- seq(-3, 3, length.out = 100)
  prediction <- predict(best.neural.net, newdata = x.change)
  plot(x.change[, j][-100], diff(prediction) / (6 / 99), ylim = c(-0.5, 0.5),
       "l", lwd = 2, main = paste(names(training.nn)[j+1]), col = "blue")
  abline(h = 0, lty = 2)
  abline(h = ols$coefficients[j + 1], lty = 2, col = "red", lwd = 2)
}


#### Optymalizacja progu odcięcia dla najlepszej sieci neuronowej

CalculateProfit <-function(cut.off, profit.matrix, score, true.y){
  prediction <- ifelse(score > cut.off, 1, 0)
  confusion.matrix <- prop.table(table(factor(prediction, levels = c(0, 1)),
                                       true.y))
  return(sum(profit.matrix * confusion.matrix))
}

score <- profits <- list()
model <- best.neural.net

CUT_OFFS <- seq(0.0, 1, by = 0.01) 

PROFIT_MATRIX <- matrix(c(3812, 291, -15420, 0), 2)
PROFIT_MATRIX
score[[1]] <- predict(model, newdata = validation.nn)
profits[[1]] <- sapply(CUT_OFFS, CalculateProfit, profit.matrix = PROFIT_MATRIX,
                       score = score[[1]], true.y = validation.nn$defaulted)
score[[2]] <- predict(model, newdata = training.nn)
profits[[2]] <- sapply(CUT_OFFS, CalculateProfit, profit.matrix = PROFIT_MATRIX,
                       score = score[[2]], true.y = training.nn$defaulted)

plot(data.frame(CUT_OFFS, 2690), type = "l", lty = 3, log = "y",
     ylim = range(c(2690, unlist(profits))),
     ylab = "Zysk per pożyczka", xlab = "Próg odcięcia")
for (i in 1:2) {
  lines(CUT_OFFS, profits[[i]], lty = i, lwd = 2)
  points(CUT_OFFS[which.max(profits[[i]])], max(profits[[i]]),
         pch = 19, cex = 1.3)
}

legend("bottomright", c("Walidacyjny", "Uczący", "bez modelu"),
       lty = c(1, 2, 3), cex = .7, ncol = 3,
       lwd = c(2, 2, 1))

max.profit <- max(profits[[1]])
max.profit
cutoff <- CUT_OFFS[which.max(profits[[1]])]
cutoff

prediction1 <- ifelse(score[[1]] > cutoff, 1, 0)
trafnosc1 <- table(prediction1, validation.nn$defaulted)
(trafnosc1[1,1] + trafnosc1[2,2]) / sum(trafnosc1)
trafnosc1[2,2]/(trafnosc1[1,2] + trafnosc1[2,2])

prediction2 <- ifelse(score[[2]] > cutoff, 1, 0)
trafnosc2 <- table(prediction2, training.nn$defaulted)
(trafnosc2[1,1] + trafnosc2[2,2]) / sum(trafnosc2)
trafnosc2[2,2]/(trafnosc2[1,2] + trafnosc2[2,2])


