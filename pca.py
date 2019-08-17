import csv
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib
matplotlib.use("WebAgg")
import matplotlib.pyplot as plt
import numpy as np
import statistics
import json

# data = np.array([[40,50,60],[50,70,60],[80,70,90],[50,60,80]])
# print(data.T)
#
# # Plot PCA
# # X = variance
# # Standardizing the features
# # X = StandardScaler().fit_transform(X)
# pca = PCA(n_components=2)
# result = pca.fit_transform(data)
#
# result2 = pca.fit_transform(data.T)
#
# print(result)
#
# print(result2)
# plt.scatter(result[:, 0], result[:, 1])


# Get data from csv and save to dictionary
dictionary = {}
with open('all_stocks_5yr.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        next(csv_file)
        for row in csv_reader:

                if (row[6] not in dictionary):
                        previous = 100
                        dictionary[row[6]] = []

                # Get one tick per month
                month = int(row[0].split("-")[0])
                if month != previous:
                        previous = month
                        dictionary[row[6]].append(float(row[4]))

# Remove ticks that have smaller history
for tick in list(dictionary.keys()):
        if len(dictionary[tick]) != 6:
                del dictionary[tick]

variance = []

for tick in dictionary:
        history = dictionary[tick]
        var = []
        for i in range(1, len(history)):
                var.append((history[i] - history[i-1]) / history[i-1])
        variance.append(var)

variance2 = []
variance = np.transpose(variance)
for stock in variance:
        mean = statistics.mean(stock)
        std = np.std(stock)

        a = [(i - mean)/std for i in stock]
        variance2.append(a)

# Save json
data = {}
keys = list(dictionary.keys())
for i, q in enumerate(np.transpose(variance2)):
        # data[keys[i]] = []

        dic = {}
        for j, r in enumerate(q):
                dic[j] = r
                # data[keys[i]].append({j: r})
        data[keys[i]] = dic
        # print(i, q)
with open('data.txt', 'w') as outfile:
    json.dump(data, outfile)


# covariance = np.cov(variance2)
correlation = np.corrcoef(variance2)

print(np.transpose(variance2))
print(correlation)

eig = np.linalg.eig(correlation)

eigenvalue = eig[0]
eigenvector = eig[1]

print([i/np.sum(eigenvalue) for i in eigenvalue])

pca = []

varianceT = np.transpose(variance)

for i, var in enumerate(varianceT):

        pc1 = eigenvector[0] @ var
        pc2 = eigenvector[1] @ var

        pca.append([pc1, pc2])

plt.scatter([i[0] for i in pca], [i[1] for i in pca])

# Add top annotations
for i, word in enumerate(dictionary.keys()):
        plt.annotate(word, xy=(pca[i][0], pca[i][1]))

# eig2 = [i/np.sum(eigenvalue) for i in eigenvalue]


# print(np.sum(eig2))
#
# print('done')

# for i in correlation:
#         for j in i:
#                 if j < 0:
#                         print("negative")

# Plot PCA
# X = variance
# Standardizing the features
# X = StandardScaler().fit_transform(X)
# pca = PCA(n_components=2)
# result = pca.fit_transform(covariance)
# plt.scatter(result[:, 0], result[:, 1])
#
# # Add top annotations
# # for i, word in enumerate(dictionary.keys()):
# #         plt.annotate(word, xy=(result[i, 0], result[i, 1]))
#
#
#
# # Plot
plt.show()