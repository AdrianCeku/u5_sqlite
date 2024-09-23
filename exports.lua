local function createTable(tableName, columns)
    TriggerEvent("u5_sqlite:js:createTable", tableName, columns)
end

local function insert(tableName, columnsAndvalues)
    TriggerEvent("u5_sqlite:js:insert", tableName, columnsAndvalues)
end

local function update(tableName, columnsAndvalues, where, rawWhere)
    TriggerEvent("u5_sqlite:js:update", tableName, columnsAndvalues, where, rawWhere)
end

local function delete(tableName, where, rawWhere)
    TriggerEvent("u5_sqlite:js:delete", tableName, where, rawWhere)
end

local function executeRawWithParams(query, params)
    TriggerEvent("u5_sqlite:js:executeRawWithParams", query, params)
end

local function executeRaw(query)
    TriggerEvent("u5_sqlite:js:executeRaw", query)
end


--+--+--+--+--+--+--+ SELECT +--+--+--+--+--+--+--+

local callbacks = {}
local nextCallbackId = 0

local function getCallbackId()
    nextCallbackId = nextCallbackId + 1
    return tostring(nextCallbackId)
end

function formatResponse(response)
    if not response[1] then return nil end
    response = response[1]

    local retVal = {}

    for i=1, #response.values do
        local values = response.values[i]
        local returnTable = {}
        
        for j=1, #response.columns do
            local column = response.columns[j]
            returnTable[column] = values[j]
        end

        table.insert(retVal, returnTable)
    end

    return retVal
end


local function selectFromDb(tableName, columns, where, rawWhere)
    local resultPromise = promise:new()
    local callbackId = getCallbackId()

    callbacks[callbackId] = function(response)
        resultPromise:resolve(response)
    end

    TriggerEvent("u5_sqlite:js:select", callbackId, tableName, columns, where, rawWhere)

    local result = Citizen.Await(resultPromise)
    return formatResponse(result)
end 

AddEventHandler("u5_sqlite:lua:callbackResult", function(callbackId, response)
    local callback = callbacks[callbackId]

    if callback then
        callback(response)
        callbacks[callbackId] = nil
    end
end)

--+--+--+--+--+--+--+ EXPORTS +--+--+--+--+--+--+--+
exports("createTable", createTable)
exports("insert", insert)
exports("update", update)
exports("delete", delete)
exports("executeRawWithParams", executeRawWithParams)
exports("executeRaw", executeRaw)
exports("select", selectFromDb)
