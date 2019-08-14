import csv
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib
matplotlib.use("WebAgg")
import matplotlib.pyplot as plt
import numpy as np

# Get data from csv and save to dictionary
dictionary = {}
with open('all_stocks_5yr.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        next(csv_file)
        for row in csv_reader:
                if (row[6] not in dictionary):
                        dictionary[row[6]] = []
                dictionary[row[6]].append(float(row[4]))

# Remove ticks that have smaller history
for tick in list(dictionary.keys()):
        if len(dictionary[tick]) != 1259:
                del dictionary[tick]

variance = []

for tick in dictionary:
        history = dictionary[tick]
        var = []
        for i in range(1, len(history)):
                var.append((history[i] - history[i-1]) / history[i-1])
        variance.append(var)

# Plot PCA
X = variance
# Standardizing the features
X = StandardScaler().fit_transform(X)
pca = PCA(n_components=2)
result = pca.fit_transform(X)
plt.scatter(result[:, 0], result[:, 1])

# Add top annotations
for i, word in enumerate(dictionary.keys()):
        plt.annotate(word, xy=(result[i, 0], result[i, 1]))

# Plot
plt.show()

# # key = "O1A7PUFZII8TXHAA"
# #
# # request = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=MSFT&apikey=" + key
#
# symbols = ['MMM' ,'AOS' ,'ABT' ,'ABBV' ,'ACN' ,'ATVI' ,'AYI' ,'ADBE' ,'AAP' ,'AMD' ,'AES' ,'AET' ,'AMG' ,'AFL' ,'A' ,'APD' ,'AKAM' ,'ALK' ,'ALB' ,'ARE' ,'ALXN' ,'ALGN' ,'ALLE' ,'AGN' ,'ADS' ,'LNT' ,'ALL' ,'GOOGL' ,'GOOG' ,'MO' ,'AMZN' ,'AEE' ,'AAL' ,'AEP' ,'AXP' ,'AIG' ,'AMT' ,'AWK' ,'AMP' ,'ABC' ,'AME' ,'AMGN' ,'APH' ,'APC' ,'ADI' ,'ANDV' ,'ANSS' ,'ANTM' ,'AON' ,'APA' ,'AIV' ,'AAPL' ,'AMAT' ,'APTV' ,'ADM' ,'ARNC' ,'AJG' ,'AIZ' ,'T' ,'ADSK' ,'ADP' ,'AZO' ,'AVB' ,'AVY' ,'BHGE' ,'BLL' ,'BAC' ,'BAX' ,'BBT' ,'BDX' ,'BRK.B' ,'BBY' ,'BIIB' ,'BLK' ,'HRB' ,'BA' ,'BKNG' ,'BWA' ,'BXP' ,'BSX' ,'BHF' ,'BMY' ,'AVGO' ,'BF.B' ,'CHRW' ,'CA' ,'COG' ,'CDNS' ,'CPB' ,'COF' ,'CAH' ,'KMX' ,'CCL' ,'CAT' ,'CBOE' ,'CBRE' ,'CBS' ,'CELG' ,'CNC' ,'CNP' ,'CTL' ,'CERN' ,'CF' ,'SCHW' ,'CHTR' ,'CVX' ,'CMG' ,'CB' ,'CHD' ,'CI' ,'XEC' ,'CINF' ,'CTAS' ,'CSCO' ,'C' ,'CFG' ,'CTXS' ,'CME' ,'CMS' ,'KO' ,'CTSH' ,'CL' ,'CMCSA' ,'CMA' ,'CAG' ,'CXO' ,'COP' ,'ED' ,'STZ' ,'GLW' ,'COST' ,'COTY' ,'CCI' ,'CSRA' ,'CSX' ,'CMI' ,'CVS' ,'DHI' ,'DHR' ,'DRI' ,'DVA' ,'DE' ,'DAL' ,'XRAY' ,'DVN' ,'DLR' ,'DFS' ,'DISCA' ,'DISCK' ,'DISH' ,'DG' ,'DLTR' ,'D' ,'DOV' ,'DWDP' ,'DPS' ,'DTE' ,'DUK' ,'DRE' ,'DXC' ,'ETFC' ,'EMN' ,'ETN' ,'EBAY' ,'ECL' ,'EIX' ,'EW' ,'EA' ,'EMR' ,'ETR' ,'EVHC' ,'EOG' ,'EQT' ,'EFX' ,'EQIX' ,'EQR' ,'ESS' ,'EL' ,'RE' ,'ES' ,'EXC' ,'EXPE' ,'EXPD' ,'ESRX' ,'EXR' ,'XOM' ,'FFIV' ,'FB' ,'FAST' ,'FRT' ,'FDX' ,'FIS' ,'FITB' ,'FE' ,'FISV' ,'FLIR' ,'FLS' ,'FLR' ,'FMC' ,'FL' ,'F' ,'FTV' ,'FBHS' ,'BEN' ,'FCX' ,'GPS' ,'GRMN' ,'IT' ,'GD' ,'GE' ,'GGP' ,'GIS' ,'GM' ,'GPC' ,'GILD' ,'GPN' ,'GS' ,'GT' ,'GWW' ,'HAL' ,'HBI' ,'HOG' ,'HRS' ,'HIG' ,'HAS' ,'HCA' ,'HCP' ,'HP' ,'HSIC' ,'HES' ,'HPE' ,'HLT' ,'HOLX' ,'HD' ,'HON' ,'HRL' ,'HST' ,'HPQ' ,'HUM' ,'HBAN' ,'HII' ,'IDXX' ,'INFO' ,'ITW' ,'ILMN' ,'INCY' ,'IR' ,'INTC' ,'ICE' ,'IBM' ,'IP' ,'IPG' ,'IFF' ,'INTU' ,'ISRG' ,'IVZ' ,'IPGP' ,'IQV' ,'IRM' ,'JBHT' ,'JEC' ,'SJM' ,'JNJ' ,'JCI' ,'JPM' ,'JNPR' ,'KSU' ,'K' ,'KEY' ,'KMB' ,'KIM' ,'KMI' ,'KLAC' ,'KSS' ,'KHC' ,'KR' ,'LB' ,'LLL' ,'LH' ,'LRCX' ,'LEG' ,'LEN' ,'LUK' ,'LLY' ,'LNC' ,'LKQ' ,'LMT' ,'L' ,'LOW' ,'LYB' ,'MTB' ,'MAC' ,'M' ,'MRO' ,'MPC' ,'MAR' ,'MMC' ,'MLM' ,'MAS' ,'MA' ,'MAT' ,'MKC' ,'MCD' ,'MCK' ,'MDT' ,'MRK' ,'MET' ,'MTD' ,'MGM' ,'KORS' ,'MCHP' ,'MU' ,'MSFT' ,'MAA' ,'MHK' ,'TAP' ,'MDLZ' ,'MON' ,'MNST' ,'MCO' ,'MS' ,'MSI' ,'MYL' ,'NDAQ' ,'NOV' ,'NAVI' ,'NKTR' ,'NTAP' ,'NFLX' ,'NWL' ,'NFX' ,'NEM' ,'NWSA' ,'NWS' ,'NEE' ,'NLSN' ,'NKE' ,'NI' ,'NBL' ,'JWN' ,'NSC' ,'NTRS' ,'NOC' ,'NCLH' ,'NRG' ,'NUE' ,'NVDA' ,'ORLY' ,'OXY' ,'OMC' ,'OKE' ,'ORCL' ,'PCAR' ,'PKG' ,'PH' ,'PAYX' ,'PYPL' ,'PNR' ,'PBCT' ,'PEP' ,'PKI' ,'PRGO' ,'PFE' ,'PCG' ,'PM' ,'PSX' ,'PNW' ,'PXD' ,'PNC' ,'RL' ,'PPG' ,'PPL' ,'PX' ,'PFG' ,'PG' ,'PGR' ,'PLD' ,'PRU' ,'PEG' ,'PSA' ,'PHM' ,'PVH' ,'QRVO' ,'QCOM' ,'PWR' ,'DGX' ,'RRC' ,'RJF' ,'RTN' ,'O' ,'RHT' ,'REG' ,'REGN' ,'RF' ,'RSG' ,'RMD' ,'RHI' ,'ROK' ,'COL' ,'ROP' ,'ROST' ,'RCL' ,'SPGI' ,'CRM' ,'SBAC' ,'SCG' ,'SLB' ,'STX' ,'SEE' ,'SRE' ,'SHW' ,'SPG' ,'SWKS' ,'SLG' ,'SNA' ,'SO' ,'LUV' ,'SWK' ,'SBUX' ,'STT' ,'SRCL' ,'SYK' ,'STI' ,'SIVB' ,'SYMC' ,'SYF' ,'SNPS' ,'SYY' ,'TROW' ,'TTWO' ,'TPR' ,'TGT' ,'TEL' ,'FTI' ,'TXN' ,'TXT' ,'BK' ,'CLX' ,'COO' ,'HSY' ,'MOS' ,'TRV' ,'DIS' ,'TMO' ,'TIF' ,'TWX' ,'TJX' ,'TMK' ,'TSS' ,'TSCO' ,'TDG' ,'TRIP' ,'FOXA' ,'FOX' ,'TSN' ,'USB' ,'UDR' ,'ULTA' ,'UAA' ,'UA' ,'UNP' ,'UAL' ,'UNH' ,'UPS' ,'URI' ,'UTX' ,'UHS' ,'UNM' ,'VFC' ,'VLO' ,'VAR' ,'VTR' ,'VRSN' ,'VRSK' ,'VZ' ,'VRTX' ,'VIAB' ,'V' ,'VNO' ,'VMC' ,'WMT' ,'WBA' ,'WM' ,'WAT' ,'WEC' ,'WFC' ,'WELL' ,'WDC' ,'WU' ,'WRK' ,'WY' ,'WHR' ,'WMB' ,'WLTW' ,'WYN' ,'WYNN' ,'XEL' ,'XRX' ,'XLNX' ,'XL' ,'XYL' ,'YUM' ,'ZBH' ,'ZION' ,'ZTS']
#
# import requests
# # import alpha_vantage
# import json
#
#
# API_URL = "https://www.alphavantage.co/query"
#
# history = []
#
# for symbol in symbols:
#         data = { "function": "TIME_SERIES_DAILY",
#         "symbol": symbol,
#         "outputsize" : "full",
#         "datatype": "json",
#         "apikey": "O1A7PUFZII8TXHAA" }
#         response = requests.get(API_URL, data)
#         data = response.json()
#         print(symbol)
#         a = (data['Time Series (Daily)'])
#         keys = (a.keys())
#         hist = []
#         for key in keys:
#                 hist.append(a[key]['4. close'])
#         print(len(hist))
#         history.append(hist)

